import * as Express from "express";
import { findSuggestions } from "../loader";

/**
 * @param req : Express.Request object containing the query as a parameter 
 * @param res : Express.Response object containing the response
 */
export const autocompleteGet = (
  req: Express.Request,
  res: Express.Response
) => {
  console.time(__filename);
  const { input } = req.query as { input: string };

  //  if input is not defined, return empty array
  if (!input) {
    res.json([]);
    return;
  }

  console.time("getSuggestedQueryExecutionTime");
  const result = findSuggestions(input);
  console.timeEnd("getSuggestedQueryExecutionTime");
  console.log("input : ", input);
  console.log("result : ", result);
  res.send(result);
  console.timeEnd(__filename);
};
