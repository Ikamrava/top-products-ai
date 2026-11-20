import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: Home }, // Default route
    // Future pages like { path: 'favorites', component: FavoritesComponent } will go here
];
