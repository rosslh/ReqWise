import { writable } from "svelte/store";

export const currentProject = writable({});
export const sidebarHidden = writable(false);

export const modalContent = writable(false);
export const modalProps = writable({});

export const streamData = writable([]);