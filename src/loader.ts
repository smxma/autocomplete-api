import * as Path from "path";
//@ts-ignore
import * as fs from "fs.promises";
import first from "lodash/first";
import * as Fuse from 'fuse.js';

/**
 * I found that library (fuse.js) that use a bitmap algorithm to perform fuzzy search.
 * I did some tests to see how responsive it is. It works well for this job and runs fast. 
 */
const optionsFuse = {
  includeScore: true, 
  isCaseSensitive:false, 
  includeMatches:true, 
  minMatchCharLength:1, 
  shouldSort:true, 
  threshold:0.20 //Low threshold to avoid less accurate results
};

type IQueryObject = {
  [key: string]: string[];
}
export type IQuery =  {
  [key: string]: IQueryObject;
}

// This variable is used to store the query object returned by the loader
export let parsedQueries: IQuery = {};

/**
 * @description
 * Load the queries from the CSV file and do some operations on it.
 * Steps to prepare data for search logic:
 * 1- First, we split the queries into an array of lines.
 * 2- Then, we skip the first line (the header).
 * 3- Then, we split each line to get only the first column (the suggested queries).
 * 4- Then, we remove empty lines.
 * 5- Then, we call trim function on each line to remove whitespace that may be present.
 * 6- Then, we sort the lines.
 * @breif  
 * The idea behind this solution is to create a multi-dimensional array of queries using the 
 * first letter and the second letter of the query. This way, we can perform search efficiently.
 * 
 * For exemple : 
 * {"r":
 *       {"re":["red book","red shirt","red wine"],
 *       "ro":["routes","ro","rodin","robe rouge"],"]},
 *       **********************************
 *       ********************************** 
 * }
 **/
export const loader = async () => {
  const csvFilePath = Path.resolve(__dirname, "../data/history.csv");
  const fileContent = await fs.readFile(csvFilePath, "utf8");
  const lines = fileContent
    .split("\n")
    .slice(1)
    .map((line: string) => first(line.split(","))) 
    .filter((line: string) => line) 
    .map((line: string) => line?.trim())
    .sort();

  const setLines = new Set<string>(lines);
  for (const query of setLines) {
    if (query && query.length > 0) {
      const firstElement: string = query[0].toLowerCase();
      if (firstElement) {
        if (!parsedQueries[firstElement]) {
          parsedQueries[firstElement] = {};
        }
        if (query.length >= 2) {
          const twoFirstChars: string = query.slice(0, 2).toLowerCase();
          if (!parsedQueries[firstElement][twoFirstChars]) {
            parsedQueries[firstElement][twoFirstChars] = [];
          }
          parsedQueries[firstElement][twoFirstChars].push(query);
        }
      }
    }
  }
};

/**
 * @description This function is used to get queries from the parsedQueries object.
 * @param query The query to search for
 * @returns The set of suggested queries that match with the first two elements of the query
 */
export const getQueries = (query: string) => {
  // Get the first element of the query string
  const firstElement = first(query)?.toLowerCase(); 
  if (firstElement) {
    if (parsedQueries[firstElement]) {
      if (query.length >= 2) {
        const twoFirstChars = query.slice(0, 2).toLowerCase();
        if (parsedQueries[firstElement][twoFirstChars]) {
          return parsedQueries[firstElement][twoFirstChars];
        }
      }
      return Object.keys(parsedQueries[firstElement]);
    }
  }

  return [];
};

/**
 * @description Find the suggested queries that match with the query string provided as parameter
 * If the query string matches with 
 * @param query The query to search for
 * @returns The set of suggested queries that match with the query string (approximately matching or exact matching)
 */
export const findSuggestions = (query: string) => {
  const suggestedQueries = getQueries(query);
  const matches = suggestedQueries.filter((suggested) =>
    suggested.toLowerCase().startsWith(query.toLowerCase())
  );

  if (matches.length === 0) {
    const fuse = new Fuse.default(suggestedQueries, optionsFuse);
    //Search result will sort by ascending relevance score
    fuse.search(query.toLowerCase()).sort().map((element) => {
      matches.push(element.item);
    })
  }
  // Limit the number of suggested queries to 10 results
  return matches.length > 10 ? matches.slice(0, 10) : matches;
};
