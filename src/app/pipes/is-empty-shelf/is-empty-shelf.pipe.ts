import { Pipe, PipeTransform } from '@angular/core';
import { BookReturned, BookBorrowed } from 'src/app/models/forms/library-book';
import { IPackage } from 'src/app/models/forms/package.model';

@Pipe({
  name: 'isEmptyShelf',
  standalone: true,
})
export class IsEmptyShelfPipe implements PipeTransform {
  transform(
    books: BookReturned[] | BookBorrowed[] | { Status: string }[],
    ...args: unknown[]
  ): unknown {
    if (!books || books.length === 0) return false;
    let items = Object.keys(books[0]);
    return items.length === 1 && items.includes('Status');
  }
}

@Pipe({
  name: 'findPackage',
  standalone: true,
})
export class FindPackagePipe implements PipeTransform {
  transform(packages: IPackage[], packageId: number) {
    if (!packages || packages.length === 0) return null;
    return packages.find((p) => p.Package_Mas_Sno === packageId);
  }
}

@Pipe({
  name: 'switchPackageName',
  standalone: true,
})
export class SwitchPackageNamePipe implements PipeTransform {
  transform(packageName: string, ...args: any[]) {
    switch (packageName) {
      case 'Gold':
        return 'assets/components/coin.png';
      case 'Silver':
        return 'assets/components/silver-badge.png';
      case 'Trail':
        return 'assets/components/box.png';
      default:
        return 'assets/components/coin.png';
    }
  }
}

@Pipe({
  name: 'switchPackageNameForColor',
  standalone: true,
})
export class SwitchPackageNameForColorPipe implements PipeTransform {
  transform(packageName: string, ...args: any[]) {
    switch (packageName) {
      case 'Gold':
        return '#F7EF6A';
      case 'Silver':
        return '#EAEAEA';
      case 'Trail':
        return '#EBDAB0';
      default:
        return '#F7EF6A';
    }
  }
}
