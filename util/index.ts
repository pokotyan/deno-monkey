export type ValueOf<T> = T[keyof T];

const MONKEY_FACE = `
            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
 \\ '- ,\\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '-----'
`;

export const genParserErrors = (errors: string[]) => {
  let error = "";
  error += `${MONKEY_FACE}\n`;
  error += "Woops! We ran into some monkey business here!\n";
  error += "parser errors:";

  errors.forEach((err) => {
    error += `${err}\n`;
  });

  return error;
};
