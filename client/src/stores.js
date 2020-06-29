import { writable } from "svelte/store";

export const sidebarHidden = writable(false);

export const modalContent = writable(false);
export const modalProps = writable({});

export const projectShouldUpdate = writable(false);
export const reqgroupsToUpdate = writable([]);

export const currentProjectId = writable(-1);