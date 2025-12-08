import { Routes } from '@angular/router';
import { NewDocument } from './pages/new-document/new-document';
import { Inbox } from './pages/inbox/inbox';
import { Sent } from './pages/sent/sent';

export const documentsRoutes: Routes = [
    {
        path: 'nuevo',
        component: NewDocument
    },
    {
        path: 'bandeja-entrada',
        component: Inbox
    },
    {
        path: 'enviados',
        component: Sent
    }
];
