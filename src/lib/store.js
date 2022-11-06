import { writable } from 'svelte/store';

//export const rules = writable();
//export const namespace = writable()
//export const roleName = writable()

export const roleObject = writable(JSON.parse(localStorage.getItem("roleObject")) || {"name":"My Role", "rules": [{
    "apiGroups":[],
    "resources": [],
    "resourceNames": [],
    "verbs":[]
  }
]});
roleObject.subscribe((value) => {
    return localStorage.setItem("roleObject", JSON.stringify(value))
});