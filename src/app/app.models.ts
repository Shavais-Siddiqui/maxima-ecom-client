export class Category {
  constructor(public _id: string,
    public name: string,
    public hasSubCategory: boolean,
    public parentId: number) { }
}

export class Product {
  constructor(public _id: string,
    public name: string,
    public images: Array<any>,
    public oldPrice: number,
    public newPrice: number,
    public discount: number,
    public ratingsCount: number,
    public ratingsValue: number,
    public description: string,
    public availibilityCount: number,
    public cartCount: number,
    public color: Array<string>,
    public size: Array<string>,
    public weight: number,
    public categoryId: any) { }
}

export class User {
  constructor(public name: string,
    public email: string) { }
}
