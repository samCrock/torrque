import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

    transform(value: Array<any>, args?: any): any {
        let ordered = []
        if (value) {
            console.log(value, args, value.length)
            ordered = value.sort(function(a, b) {
                return parseFloat(a[args]) - parseFloat(b[args])
            })

            console.log('ordered', ordered)
        } else { return null }
        return ordered

    }

}
