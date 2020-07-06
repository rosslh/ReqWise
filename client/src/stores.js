import { writable } from "svelte/store";
import watchMedia from "svelte-media";

export const media = watchMedia({
    small: "(max-width: 749px)",
    large: "(min-width: 750px)",
});
export const menuHidden = writable(false);

export const modalContent = writable(false);
export const modalProps = writable({});

export const unreadAlerts = writable(false);
export const projectShouldUpdate = writable(false);
export const reqgroupsToUpdate = writable([]);

export const currentProjectId = writable(-1);