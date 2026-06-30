// file: src/app/app.routes.ts

import { Routes } from '@angular/router';
import { HangulHomePage } from './hangul/pages/hangul-home.page';
import { HangulGroupPage } from './hangul/pages/hangul-group.page';
import { HangulPracticePage } from './hangul/pages/hangul-practice.page';
import { HangulGroupTestPage } from './hangul/pages/hangul-group-test.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'hangul',
    pathMatch: 'full',
  },
  {
    path: 'hangul',
    component: HangulHomePage,
  },
  {
    path: 'hangul/groups/:groupId',
    component: HangulGroupPage,
  },
  {
    path: 'hangul/groups/:groupId/test',
    component: HangulGroupTestPage,
  },
  {
    path: 'hangul/practice/:groupId/:itemId',
    component: HangulPracticePage,
  },
];