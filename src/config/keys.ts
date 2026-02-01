export const getKeyName = (...args: string[]) => `Landing:${args.join(":")}`;

export const slideShowKeyById = (id: string) => getKeyName("slideShow", id);
export const slideShowsKey = (params :string) => getKeyName("slideShow" , params);

export const slideShowsSlidesKey = (...params :string[]) => getKeyName("slideShow" , ...params);
