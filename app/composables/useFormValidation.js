import dayjs from "dayjs";

const rules = {
  accepted: (value) => {
    /** The value must be yes, on, 1 or true. Useful for checkbox inputs */
    return ["ja", "nein", "1", 1, true, "true"].includes(value);
  },
  alpha: (value, set = "default") => {
    /**
     * Checks if a value contains only alphabetical characters.
     * Available character sets:
     * - default: Includes most accented characters (e.g., ä, ù, ś), using Unicode character classes.
     * - latin: Only basic Latin characters [a-zA-Z].
     */
    const sets = {
      default: /^\p{L}+$/u, // Unicode letter characters
      latin: /^[a-z]+$/i, // Latin alphabet characters
    };

    const stringValue = String(value);
    const selectedSet = sets[set] ? sets[set] : sets.default;

    return selectedSet.test(stringValue);
  },
  containsAlpha: (value, set = "default") => {
    /**
     * Checks if a value contains any alphabetical characters.
     * Available character sets:
     * - default: Includes most accented characters (e.g., ä, ù, ś) using Unicode character classes.
     * - latin: Only basic Latin characters [a-zA-Z].
     */
    const sets = {
      default: /\p{L}/u, // Unicode letter characters
      latin: /[a-z]/i, // Latin alphabet characters
    };

    const stringValue = String(value);
    const selectedSet = sets[set] ? sets[set] : sets.default;

    return selectedSet.test(stringValue);
  },
  alphanumeric: (value, set = "default") => {
    /**
     * Checks if a value consists only of alphabetical characters or numeric digits.
     * Available character sets:
     * - default: Includes most accented alphabetical characters (e.g., ä, ù, ś) plus digits.
     * - latin: Only basic Latin characters [a-zA-Z] plus digits.
     */
    const sets = {
      default: /^[0-9\p{L}]+$/u, // Unicode letters and digits
      latin: /^[0-9a-z]+$/i, // Latin alphabet and digits
    };

    const stringValue = String(value);
    const selectedSet = sets[set] ? sets[set] : sets.default;

    return selectedSet.test(stringValue);
  },
  alphaSpaces: (value, set = "default") => {
    /**
     * Checks if a value consists only of alphabetical characters or spaces.
     * Available character sets:
     * - default: Includes most accented alphabetical characters (e.g., ä, ù, ś) plus spaces.
     * - latin: Only basic Latin characters [a-zA-Z] plus spaces.
     */
    const sets = {
      default: /^[\p{L} ]+$/u, // Unicode letters and spaces
      latin: /^[a-z ]+$/i, // Latin alphabet and spaces
    };

    const stringValue = String(value);
    const selectedSet = sets[set] ? sets[set] : sets.default;

    return selectedSet.test(stringValue);
  },
  between: (value, from, to) => {
    /**
     * Checks if a number is (inclusively) between two other numbers.
     * The input value must be a number, otherwise the validation fails.
     * It also handles the case where 'from' is greater than 'to'.
     */

    const val = Number(value);
    const numFrom = Number(from);
    const numTo = Number(to);

    if (isNaN(val) || isNaN(numFrom) || isNaN(numTo)) {
      return false;
    }

    const [a, b] = numFrom <= numTo ? [numFrom, numTo] : [numTo, numFrom];
    return val >= a && val <= b; // Check if value is between a and b
  },
  checked: (value) => {
    /** The value must be 1 or true. Useful for checkbox inputs */
    return [1, true, "true"].includes(value);
  },
  confirm: (value, foreignValue, comparison = "loose") => {
    /** Checks if the value of one input matches the value of another input — often used for password confirmations. There are two ways to specify which input to match: */

    return comparison === "strict"
      ? value === foreignValue
      : value == foreignValue;
  },
  containsAlphanumeric: (value, set = "default") => {
    /**Checks if a value contains either alphabetical characters or numeric digits. For the alphabetical portion you can pass default or latin - see contains alpha) above */
    const sets = {
      default: /[0-9\p{L}]/u,
      latin: /[0-9a-z]/i,
    };
    const selectedSet = set in sets ? set : "default";
    return sets[selectedSet].test(String(value));
  },
  containsAlphaSpaces: (value, set = "default") => {
    /** Checks if a value contains alphabetical characters or spaces. For the alphabetical portion you can pass default or latin - see contains alpha) above. */
    const sets = {
      default: /[\p{L} ]/u,
      latin: /[a-z ]/i,
    };
    const selectedSet = set in sets ? set : "default";
    return sets[selectedSet].test(String(value));
  },
  containsLowercase: (value, set = "default") => {
    /** Checks if a value contains a lowercase character. There are two character sets: latin and default. Latin characters are strictly [a-zA-Z], while the default set includes most accented characters, such as ä, ù, or ś. */
    const sets = {
      default: /\p{Ll}/u,
      latin: /[a-z]/,
    };
    const selectedSet = set in sets ? set : "default";
    return sets[selectedSet].test(String(value));
  },
  containsNumeric: (value) => {
    /** Checks if a value contains a number. */
    return /[0-9]/.test(String(value));
  },
  containsUppercase: (value, set = "default") => {
    /**
     * Checks if a value contains any uppercase characters.
     * Available character sets:
     * - default: Includes Unicode uppercase characters (e.g., Ä, Ù).
     * - latin: Only basic Latin uppercase characters [A-Z].
     */
    const sets = {
      default: /\p{Lu}/u, // Unicode uppercase letters
      latin: /[A-Z]/, // Latin uppercase letters
    };

    const stringValue = String(value);
    const selectedSet = sets[set] ? sets[set] : sets.default;

    return selectedSet.test(stringValue);
  },
  dateAfter: (value, compare = false) => {
    /**
     * Prüft, ob ein Datum nach einem bestimmten Vergleichsdatum liegt.
     * Der `compare`-Parameter kann ein String im Format 'YYYY-MM-DD' sein.
     * Wenn kein Vergleichsdatum angegeben ist, wird das aktuelle Datum verwendet.
     */

    // Versuche, beide Werte als dayjs-Objekte zu parsen, falls sie das Format 'YYYY-MM-DD' haben.
    const fieldValue = dayjs(value, "YYYY-MM-DD", true); // True sorgt dafür, dass der String strikt im Format 'YYYY-MM-DD' sein muss.
    const compareDate = compare ? dayjs(compare, "YYYY-MM-DD", true) : dayjs(); // Falls kein compare gegeben ist, nutze das aktuelle Datum.

    // Überprüfe, ob das value ein gültiges Datum ist
    if (!fieldValue.isValid()) {
      return false;
    }

    // Überprüfe, ob das Vergleichsdatum gültig ist (falls gegeben)
    if (compare && !compareDate.isValid()) {
      return false;
    }

    // Überprüfe, ob fieldValue nach compareDate liegt
    return fieldValue.isAfter(compareDate);
  },
  dateBefore: (value, compare = false) => {
    /**
     * Prüft, ob ein Datum vor einem bestimmten Vergleichsdatum liegt.
     * Der `compare`-Parameter kann ein String im Format 'YYYY-MM-DD' sein.
     * Wenn kein Vergleichsdatum angegeben ist, wird das aktuelle Datum verwendet.
     */

    // Versuche, beide Werte als dayjs-Objekte zu parsen, falls sie das Format 'YYYY-MM-DD' haben.
    const fieldValue = dayjs(value, "YYYY-MM-DD", true); // True sorgt dafür, dass das Format strikt 'YYYY-MM-DD' sein muss.
    const compareDate = compare ? dayjs(compare, "YYYY-MM-DD", true) : dayjs(); // Falls kein compare gegeben ist, nutze das aktuelle Datum.

    // Überprüfe, ob das value ein gültiges Datum ist
    if (!fieldValue.isValid()) {
      return false;
    }

    // Überprüfe, ob das Vergleichsdatum gültig ist (falls gegeben)
    if (compare && !compareDate.isValid()) {
      return false;
    }

    // Überprüfe, ob fieldValue vor compareDate liegt
    return fieldValue.isBefore(compareDate);
  },
  dateBetween: (value, dateA, dateB) => {
    /*Determines if a date is between (and including) the two dates supplied as the rule's arguments. Dates used can either be JavaScript Date objects or strings that can be parsed by Date.parse().*/
    dateA = dateA instanceof Date ? dateA.getTime() : Date.parse(dateA);
    dateB = dateB instanceof Date ? dateB.getTime() : Date.parse(dateB);
    const compareTo =
      value instanceof Date ? value.getTime() : Date.parse(String(value));
    if (dateA && !dateB) {
      dateB = dateA;
      dateA = Date.now();
    } else if (!dateA || !compareTo) {
      return false;
    }
    return compareTo >= dateA && compareTo <= dateB;
  },
  dateFormat: (value, format) => {
    /**Ensures the format of an input’s date matches a specific date format. The format should be specified using the following formatting tokens: */
    /**
        MM	Two-digit month representation (01-12)
        M	Single-digit month representation (1-12) leading zero allowed
        DD	Two-digit day of the month (01-31)
        D	Single-digit day of the month (1-31), leading zero allowed
        YY	Two-digit year
        YYYY Four-digit year 
     */
    if (format && typeof format === "string") {
      const escapeExp = (text) =>
        text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const escaped = `^${escapeExp(format)}$`;
      const formats = {
        MM: "(0[1-9]|1[012])",
        M: "([1-9]|1[012])",
        DD: "([012][0-9]|3[01])",
        D: "([012]?[0-9]|3[01])",
        YYYY: "\\d{4}",
        YY: "\\d{2}",
      };

      const tokens = Object.keys(formats);
      const regex = new RegExp(
        tokens.reduce((regex, token) => {
          return regex.replace(token, formats[token]);
        }, escaped)
      );

      return regex.test(String(value));
    }
    return !isNaN(Date.parse(String(value)));
  },
  // rule ['email']
  email: (value) => {
    /** Checks if the input contains a valid email address. */
    const isEmail =
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return isEmail.test(String(value));
  },
  // rule ['endsWidth','GbR','OHG','KG','PartG','GmbH','GmBH','AG','Ag','KGaA','eG']
  endsWidth: (value, ...stack) => {
    /** Checks if the input's value ends with a given substring. */
    /**  ['endsWidth', '.edu']*/

    console.log('endsWidth',value, ...stack);

    if (typeof value === "string" && stack.length) {
     
      return !stack.some((item) => value.endsWith(item));
    } else if (typeof value === "string" && stack.length === 0) {
      return true;
    }
    return false;
  },
  if: (value, fields, ...condition) => {
    const [validatedField, foreignField] = condition;

    // Destrukturierung der validierten Felder und der Vergleichswerte
    const [fieldId, operator, expectedValues] = validatedField;
    const [foreingFieldId, foreignOperator, foreignExpectedValues] =
      foreignField;

    // Überprüfung, ob der Wert mit den erwarteten Werten und den Fremdfeldwerten übereinstimmt
    const isValueMatching = expectedValues.some((_value) =>
      comparator[operator](_value, value)
    );
    const isForeignFieldMatching = foreignExpectedValues.some((_value) =>
      comparator[foreignOperator](_value, fields[foreingFieldId])
    );

    return !(isValueMatching && isForeignFieldMatching);
  },
  is: (value, ...stack) => {
    /** Checks that the input's value matches at least one of the provided arguments. */
    /** ['is', 'hund','maus', 'katze'] */
    return stack.some((item) => {
      if (typeof item === "object") {
        return isEqual(item, value);
      }
      return item == value;
    });
  },
  length: (value, ...stack) => {
    /**
     * Checks that the input’s value is over a given length, or between two length values.
     * ['length', 5, 16] => value must be between 5 and 16 characters
     * ['length', 2] => value must be greater than or equal to 2 characters
     * ['length', 0, 10] => value must be less than or equal to 10 characters
     */

    // Überprüfe und parse die ersten beiden Werte aus dem Stack
    const min = parseInt(stack[0], 10) || 0;
    const max =
      stack.length > 1 && !isNaN(parseInt(stack[1], 10))
        ? parseInt(stack[1], 10)
        : Infinity;

    if (typeof value === "number" && Number.isFinite(value)) {
      const length = value.toString().length; // Länge der Zahl als String
      return length >= min && length <= max;
    }

    // Handle strings and arrays (prüft die Länge)
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length >= min && value.length <= max;
    }

    // Handle objects (zählt die Anzahl der Keys)
    if (typeof value === "object" && value !== null) {
      const length = Object.keys(value).length;
      return length >= min && length <= max;
    }

    // Unsupported type
    return false;
  },
  regexMatch: (value, regexPattern) => {
    /**
     * Prüft, ob der input value mit einem gegebenen Regex übereinstimmt.
     * ['regexMatch', /^[a-z]+$/i] => value muss nur Buchstaben enthalten (case-insensitive)
     */

    // Überprüfen, ob der Wert ein String ist
    if (typeof value !== "string") {
      return false;
    }

    // Überprüfen, ob das Regex-Muster ein gültiges RegExp-Objekt ist
    const regex =
      regexPattern instanceof RegExp ? regexPattern : new RegExp(regexPattern);

    // Teste, ob der Wert dem Regex entspricht
    return regex.test(value);
  },
  lowercase: (value, set = "default") => {
    /** Checks if a value consists of only lowercase characters. There are two character sets: latin and default. Latin characters are strictly [a-zA-Z], while the default set includes most accented characters, such as ä, ù, or ś. */
    const sets = {
      default: /^\p{Ll}+$/u,
      allow_non_alpha: /^[0-9\p{Ll}!-/:-@[-`{-~]+$/u,
      allow_numeric: /^[0-9\p{Ll}]+$/u,
      allow_numeric_dashes: /^[0-9\p{Ll}-]+$/u,
      latin: /^[a-z]+$/,
    };

    const selectedSet = set in sets ? set : "default";
    return sets[selectedSet].test(String(value));
  },
  matches: (value, ...stack) => {
    /** Checks if the input matches a particular value or pattern. If you pass multiple arguments, it checks each until a match is found. */
    return stack.some((pattern) => {
      if (
        typeof pattern === "string" &&
        pattern.startsWith("/") &&
        pattern.endsWith("/")
      ) {
        pattern = new RegExp(pattern.slice(1, -1));
      }
      if (pattern instanceof RegExp) {
        return pattern.test(String(value));
      }
      return pattern === value;
    });
  },
  max: (value, maximum = 10) => {
    /** Checks that a Number is less than or equal to a maximum value. The maximum value defaults to */
    if (Array.isArray(value)) {
      return value.length <= maximum;
    }
    return Number(value) <= Number(maximum);
  },
  min: (value, minimum = 1) => {
    /** Checks that a Number is greater than or equal to a minimum value. The minimum value defaults to 1. */
    if (Array.isArray(value)) {
      return value.length >= minimum;
    }
    return Number(value) >= Number(minimum);
  },
  not: (value, ...stack) => {
    /** Checks to ensure the input data does not match a set of predefined values. */
    return !stack.some((item) => {
      if (typeof item === "object") {
        return isEqual(item, value);
      }
      return item === value;
    });
  },
  number: (value) => {
    /**Checks if the input is a valid number as evaluated by isNaN(). */
    return !isNaN(Number(value));
  },
  required: (value) => {
    if (typeof value === "string") {
      return value.trim().length > 0; // Prüft auf nicht-leere Strings
    }
    if (typeof value === "number") {
      return !isNaN(value); // Prüft, dass die Zahl keine NaN ist
    }
    if (typeof value === "boolean") {
      return true; // Booleans können nicht "leer" sein
    }
    if (Array.isArray(value)) {
      return value.length > 0; // Prüft, dass das Array nicht leer ist
    }
    if (value && typeof value === "object") {
      return Object.keys(value).length > 0; // Prüft, dass das Objekt nicht leer ist
    }

    return false; // Für alles andere: undefined, null, etc.
  },
  startsWidth: (value, ...stack) => {
    /** Checks if the input starts with one of the provided options. */

    if (typeof value === "string" && stack.length) {
      return stack.some((item) => {
        return value.startsWith(item);
      });
    } else if (typeof value === "string" && stack.length === 0) {
      return true;
    }
    return false;
  },
  symbol: (value) => {
    /** Checks if a value consists of only symbols charachters. */
    return /^[!-/:-@[-`{-~]+$/.test(String(value));
  },
  uppercase: (value, set = "default") => {
    /** Checks if a value consists of only uppercase characters. There are two character sets: latin and default. Latin characters are strictly [a-zA-Z], while the default set includes most accented characters, such as ä, ù, or ś. */

    const sets = {
      default: /^\p{Lu}+$/u,
      latin: /^[A-Z]+$/,
    };
    const selectedSet = set in sets ? set : "default";
    return sets[selectedSet].test(String(value));
  },
  url: (value, stack) => {
    /** Checks if the input value appears to be a properly formatted URL including the protocol. This does not check if the URL actually resolves. */
    try {
      const protocols = stack.length ? stack : ["http:", "https:"];
      const url = new URL(String(value));
      return protocols.includes(url.protocol);
    } catch {
      return false;
    }
  },
};

export function useFormValidation(fields) {
  const validationResults = {};
  const brackets = /\[\d+\]/;

  fields.forEach((field) => {
    field.validationErrors = [];

    const {
      value,
      validation = [],
      validationMessages,
      validationErrors,
      disabled = false,
    } = field;

    if (!disabled) {
      // zum Beispiel ['length',0,24] erster key = rule, folgenden keys = ...ruleArgs
      for (let [rule, ...ruleArgs] of validation) {
        //console.log(`rule for ${field.id}`,rule);
        //console.log('ruleArgs',ruleArgs);

        const checkRuleIndex = rule.match(brackets); // Überprüfe, ob die Regel Klammern (z.B. 'length[1]') enthält für wiederholte validierungen und extrahiere den Index
        const hasBrackets = !!checkRuleIndex; // Boolean, um Klammern zu erkennen
        const ruleIndex = hasBrackets
          ? Number(checkRuleIndex[0].slice(1, -1))
          : -1;

        // Entferne Klammern aus der Regel, wenn sie vorhanden sind
        if (hasBrackets) {
          rule = rule.replace(brackets, ""); // entfernt z.B. [1] aus 'length[1]'
        }

        // Prüfe, ob die Validierungsregel als Funktion existiert
        const validationRule = rules[rule];
        if (typeof validationRule !== "function") {
          console.error(`Validierungsregel '${rule}' ist nicht definiert.`);
          validationErrors.push({
            rule,
            message: `Die Validierungsregel '${rule}' ist nicht definiert.`,
          });
          break; // Schleife abbrechen, wenn Regel nicht definiert
        }

        // Dynamische Argumente zusammenstellen

        const dynamicArgs = [
          value,
          ...(rule === "if"
            ? [
                fields.reduce((acc, { id, value }) => {
                  acc[id] = value;
                  return acc;
                }, {}),
              ]
            : []),
          ...ruleArgs,
        ];

        // Führe die Validierungsregel aus
        const isValid = validationRule(...dynamicArgs);

        // Falls die Validierung fehlschlägt, füge eine Fehlermeldung hinzu
        if (!isValid) {
          const ruleKey = hasBrackets ? `${rule}[${ruleIndex}]` : rule; // Erzeuge den Regel-Schlüssel
          validationErrors.push({
            id: field.id,
            rule,
            message:
              validationMessages[ruleKey] ||
              `Validierung für '${rule}' fehlgeschlagen.`,
          });
        }
      }
    }

    if (validationErrors.length > 0) {
      validationResults[field.name] = validationErrors;
    }
  });

  return validationResults;
}
