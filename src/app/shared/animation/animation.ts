import { animate, state, style, transition, trigger } from '@angular/animations';

export const combinedSlideAnimation = trigger('combinedSlideAnimation', [
    // Slide in from outside
    state('void', style({
        transform: 'translateX({{start}})'
    }), { params: { start: '0%' } }),
    state('*', style({
        transform: 'translateX(0)'
    })),
    transition(':enter', [
        animate('500ms linear')
    ]),
    // Slide in and out
    transition(':leave', [
        animate('500ms ease-out', style({
            transform: 'translateX({{end}})'
        }))
    ])
]);