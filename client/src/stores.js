import { writable as persist } from "svelte-persistent-store/session";
import { writable } from "svelte/store";

export const jwt = persist("jwt", "");
export const userId = persist("userId", -1);

export const currentProject = writable({});

export const modalContent = writable(false);
export const modalProps = writable({});
