import { Routes } from '@angular/router';
import { BASE_ROUTE_URL } from './infrastructure/helpers/constants.const';

export const routes: Routes = [
    {
        path: BASE_ROUTE_URL,
        loadChildren: () => import('./ui/pages/pages-module').then(m => m.PagesModule)
    },
    {
        path: '',
        redirectTo: `${BASE_ROUTE_URL}`,
        pathMatch: 'prefix'
    },
    {
        path: '**',
        redirectTo: `${BASE_ROUTE_URL}`,
        pathMatch: 'prefix'
    }
];