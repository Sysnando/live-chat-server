import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule),
  },
  {
    path: 'fans',
    loadChildren: () => import('./fans/fans.module').then(m => m.FansModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
