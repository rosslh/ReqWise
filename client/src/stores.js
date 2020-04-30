import { writable } from "svelte/store";

export const currentProject = writable({});

export const modalContent = writable(false);
export const modalProps = writable({});
