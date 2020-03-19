import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterByIdPipe } from './filter-by-id.pipe';
import { FilterBrandsPipe } from './filter-brands.pipe';
import { BrandSearchPipe } from './brand-search.pipe';
import { GetNewPrice } from './get-newPrice.pipe';

@NgModule({
    imports: [ 
        CommonModule 
    ],
    declarations: [
        FilterByIdPipe,
        FilterBrandsPipe,
        BrandSearchPipe,
        GetNewPrice
    ],
    exports: [
        FilterByIdPipe,
        FilterBrandsPipe,
        BrandSearchPipe,
        GetNewPrice
    ]
})
export class PipesModule { }
