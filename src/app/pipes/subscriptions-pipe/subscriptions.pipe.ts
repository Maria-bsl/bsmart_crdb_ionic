import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'subscriptionsModuleNames',
  standalone: true,
})
export class SubscriptionModuleNamesPipe implements PipeTransform {
  transform(moduleNames: string | null, ...args: unknown[]): string[] {
    return moduleNames ? moduleNames.split(',').map((e) => e.trim()) : [];
  }
}
