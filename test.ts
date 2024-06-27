const checkIsBodyValid = (body: any) =>
  typeof body?.title === 'string' &&
  typeof body?.description === 'string' &&
  typeof body?.price === 'number' &&
  typeof body?.count === 'number';

const res = checkIsBodyValid({
  description: 'Short Product Description1',
  price: 24,
  title: 'TEST',
  count: 8,
});
console.log(res);
