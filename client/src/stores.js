import { writable as persist } from "svelte-persistent-store/session";
import { writable } from "svelte/store";

export const jwt = persist("jwt", "");
export const userId = persist("userId", "");

export const currentProject = writable({});

export const modalContent = writable(false);
export const modalProps = writable({});
