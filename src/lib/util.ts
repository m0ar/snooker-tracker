export const exhaustiveAssert = (_: never): never => {
  throw new Error('this is impossible');
};
