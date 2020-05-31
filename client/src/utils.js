
export const setLoginParam = (page, user, redirect) => {
    if (user && !page.query.l) {
        redirect(301, `${page.path}?l=1`);
    }
    else if (!user && page.query.l) {
        redirect(301, page.path.replace("?l=1", ""));
    }
};