import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    const idx = Number(params.idx);

    if (isNaN(idx) || !Number.isInteger(idx) || idx < 0) {
        throw error(400, 'Invalid game index');
    }

    return {
        idx
    };
};