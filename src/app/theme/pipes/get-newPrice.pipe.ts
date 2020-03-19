import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getNewPrice'
})
export class GetNewPrice implements PipeTransform {
    transform(oldPrice, discount) {
        console.log(oldPrice, discount)
        let discountPrice = discount / 100 * oldPrice;
        return oldPrice - discountPrice;
    }
}