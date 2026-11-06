import { Pipe, PipeTransform } from '@angular/core';

// 1 -> "visualização", anything else (0 included) -> "visualizações"
@Pipe({ name: 'viewsLabel' })
export class ViewsLabelPipe implements PipeTransform {
  transform(count: string | number | null | undefined) {
    return Number(count) === 1 ? $localize`visualização` : $localize`visualizações`;
  }
}
