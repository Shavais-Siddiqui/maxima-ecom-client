import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterById'
})
export class FilterByIdPipe implements PipeTransform {
  transform(items:Array<any>, id?) {
    return items.filter(item => item._id == id)[0];
  }
}