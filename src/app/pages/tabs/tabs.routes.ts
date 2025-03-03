import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tabs.component').then((t) => t.TabsComponent),
    children: [
      {
        path: 'tab-1',
        loadComponent: () =>
          import('../tab-1/tab-1.component').then((c) => c.Tab1Component),
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('../dashboard-form/dashboard-form.component').then(
                (v) => v.DashboardFormComponent
              ),
          },
          {
            path: 'fees',
            loadComponent: () =>
              import('../fees-form/fees-form.component').then(
                (c) => c.FeesFormComponent
              ),
          },
          {
            path: 'time-table',
            loadComponent: () =>
              import('../timetable-form/timetable-form.component').then(
                (c) => c.TimetableFormComponent
              ),
          },
          {
            path: 'results',
            loadComponent: () =>
              import('../results-form/results-form.component').then(
                (c) => c.ResultsFormComponent
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../../components/templates/exam-types/exam-types.component'
                  ).then((c) => c.ExamTypesComponent),
              },
              {
                path: ':examType',
                loadComponent: () =>
                  import(
                    '../../components/templates/pupil-marks/pupil-marks.component'
                  ).then((c) => c.PupilMarksComponent),
              },
            ],
          },
          {
            path: 'attendance',
            loadComponent: () =>
              import('../attendance-form/attendance-form.component').then(
                (c) => c.AttendanceFormComponent
              ),
          },
          {
            path: 'library',
            loadComponent: () =>
              import('../library-form/library-form.component').then(
                (l) => l.LibraryFormComponent
              ),
          },
          {
            path: 'books',
            loadComponent: () =>
              import('../books-form/books-form.component').then(
                (c) => c.BooksFormComponent
              ),
          },
          {
            path: 'get-support',
            loadComponent: () =>
              import('../get-support-form/get-support-form.component').then(
                (c) => c.GetSupportFormComponent
              ),
          },
        ],
      },
      // {
      //   path: 'transport',
      //   loadComponent: () =>
      //     import('../transport-form/transport-form.component').then(
      //       (t) => t.TransportFormComponent
      //     ),
      //   children: [
      //     {
      //       path: '',
      //       loadComponent: () =>
      //         import('../maps-form/maps-form.component').then(
      //           (j) => j.MapsFormComponent
      //         ),
      //     },
      //   ],
      // },
      {
        path: 'transport',
        loadComponent: () =>
          import('../maps-form/maps-form.component').then(
            (j) => j.MapsFormComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile-form/profile-form.component').then(
            (c) => c.ProfileFormComponent
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '../select-profile-form/select-profile-form.component'
              ).then((d) => d.SelectProfileFormComponent),
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('../edit-profile-form/edit-profile-form.component').then(
                (o) => o.EditProfileFormComponent
              ),
          },
          {
            path: 'change-password',
            loadComponent: () =>
              import(
                '../change-password-form/change-password-form.component'
              ).then((y) => y.ChangePasswordFormComponent),
          },
        ],
      },
    ],
  },
];
