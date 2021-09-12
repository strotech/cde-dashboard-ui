import React, { useEffect, useReducer } from "react";
// import axios from "axios";
import {API} from 'aws-amplify';
import Rule from "../../panels/views/RulePanel";
import ErrorMessage from "../../panels/widgets/ErrorMessage";
import SpinnerWidget from "../../panels/widgets/SpinnerWidget";

const reducer = (state, action) => {
  switch (action.type) {
    case "show_rules":
      return { ...state, rules: action.payload, newRule: "" };
    case "add_rule":
      return {
        ...state,
        rules: [...state.rules, ...action.payload],
        newRule: "",
        errors: [],
      };
    case "add_errors":
      return { ...state, rules: state.rules, errors: action.payload };
    case "delete_rule":
      return {
        ...state,
        rules: [...state.rules.filter((rule) => rule.id !== action.payload)],
      };
    case "rule_changed":
      return { ...state, newRule: action.payload };
    case "change_loading_status":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const RuleList = () => {
  const initialState = { rules: [], newRule: "", isLoading: false, errors: [] };
  const [state, dispatch] = useReducer(reducer, initialState);
  const exampleRule = "from:twitterdev has:links";
  const ruleMeaning = `This example rule will match Tweets posted by 
     TwtterDev containing links`;
  const operatorsURL =
    "/content/developer-twitter/en/docs/labs/filtered-stream/operators";
  const rulesURL = "/api/rules";

  const createRule = async (e) => {
    e.preventDefault();
    const payload = { add: [{ value: state.newRule }] };
    const amplifyPayload = {
      body: payload, 
      headers: {}, // OPTIONAL
    };

    dispatch({ type: "change_loading_status", payload: true });
    try {
      // const response = await axios.post(rulesURL, payload);
      const response = await API.post('cdedashboardapi',rulesURL,amplifyPayload).then(res=>res);
      if (response.data.body.errors)
        dispatch({ type: "add_errors", payload: response.data.body.errors });
      else {
        dispatch({ type: "add_rule", payload: response.data.body.data });
      }
      dispatch({ type: "change_loading_status", payload: false });
    } catch (e) {
      dispatch({
        type: "add_errors",
        payload: [{ detail: e.message }],
      });
      dispatch({ type: "change_loading_status", payload: false });
    }
  };

  const deleteRule = async (id) => {
    const payload = { delete: { ids: [id] } };
    dispatch({ type: "change_loading_status", payload: true });
    const amplifyPayload = {
      body: payload, 
      headers: {}, // OPTIONAL
    };
    // await axios.post(rulesURL, payload);
    await API.post('cdedashboardapi',rulesURL,amplifyPayload).then(res=>res);
    dispatch({ type: "delete_rule", payload: id });
    dispatch({ type: "change_loading_status", payload: false });
  };

  const errors = () => {
    const { errors } = state;

    if (errors && errors.length > 0) {
      return errors.map((error) => (
        <ErrorMessage key={error.title} error={error} styleType="negative" />
      ));
    }
  };

  const rules = () => {
    const { isLoading, rules } = state;

    const message = {
      title: "No rules present",
      details: [
        `There are currently no rules on this stream. Start by adding the rule 
        below.`,
        exampleRule,
        ruleMeaning,
      ],
      type: operatorsURL,
    };

    if (!isLoading) {
      if (rules && rules.length > 0) {
        return rules.map((rule) => (
          <Rule
            key={rule.id}
            data={rule}
            onRuleDelete={(id) => deleteRule(id)}
          />
        ));
      } else {
        return (
          <ErrorMessage
            key={message.title}
            error={message}
            styleType="warning"
          />
        );
      }
    } else {
      return <SpinnerWidget />;
    }
  };

  useEffect(() => {
    (async () => {
      dispatch({ type: "change_loading_status", payload: true });

      try {
        // const response = await axios.get(rulesURL);
        const response = await API.get('cdedashboardapi',rulesURL).then(res=>{
          console.log(res);
          return res;
        });
        const { data: payload = [] } = response.data.body;
        dispatch({
          type: "show_rules",
          payload,
        });
      } catch (e) {
        dispatch({ type: "add_errors", payload: [e.response.data] });
      }

      dispatch({ type: "change_loading_status", payload: false });
    })();
  }, []);

  return (
    <div>
      <form onSubmit={(e) => createRule(e)}>
     
        <div className="input-group mb-3">
          <input
            type="text"
            autoFocus={true}
            className="form-control"
            placeholder="Rule details"
            aria-label="Rule details" 
            aria-describedby="basic-addon2"
            value={state.newRule}
            onChange={(e) =>
              dispatch({ type: "rule_changed", payload: e.target.value })
            }
          />
          <div class="input-group-append">
          <button type="button" className="btn btn-outline-secondary">
            Add Rule
          </button>
          </div>
        </div>
        {errors()}
        {rules()}
      </form>
    </div>
  );
};

export default RuleList;