export const userRoles = ['user', 'guide', 'lead-guide', 'admin'];

export const filterObj = (obj: any, ...fields: string[]) => {
  const newobj: any = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};
