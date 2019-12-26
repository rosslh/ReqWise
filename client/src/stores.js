import { writable } from "svelte-persistent-store/session";

export const jwt = writable("jwt", "");
