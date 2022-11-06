<script>
import Duplicate from '../assets/duplicate.svg'
import Delete from '../assets/delete.svg'
import Tags from "svelte-tags-input";
import { roleObject } from './store.js';
import eye from '../assets/eye.svg';

export let apiVersions;
export let kinds;
export let index;
export let names;
export let verbs;
export let deleteRule;
export let duplicateRule;
let readOnly = false;
let isClusteredRole;

let resourceVerbs = ["Get","Watch","List","Create","Delete","Patch","update","deletecollection"]
let HTTPVerbs = ["get","head","post","put","patch","delete"]
let rbacVerbs = ["bind","escalate"] 
let authenticationVerbs = ["impersonate"]
let verbsOptions = [...resourceVerbs]

$: {
    if(apiVersions.includes("authentication.k8s.io"))
    {
        verbsOptions = [...resourceVerbs, ...authenticationVerbs]
    }
    else if(apiVersions.includes("rbac.authorization.k8s.io/v1") || apiVersions.includes("rbac.authorization.k8s.io") )
    {
        verbsOptions = [...resourceVerbs, ...rbacVerbs]
    }
    else
    {
        verbsOptions = [...resourceVerbs]
    }
}



const namespacedResources = {
    "v1": ["Binding","ConfigMap","Endpoints","Event","LimitRange","PersistentVolumeClaim","Pod","PodTemplate","ReplicationController","ResourceQuota","Secret","ServiceAccount","Service"],
    "apps/v1": ["ControllerRevision","DaemonSet","Deployment","ReplicaSet","StatefulSet"],
    "authorization.k8s.io/v1": ["HorizontalPodAutoscaler"],
    "batch/v1":["CronJob","Job"],
    "coordination.k8s.io/v1": ["Lease"],
    "crd.projectcalico.org/v1":["NetworkPolicy","NetworkSet"],
    "discovery.k8s.io/v1":["EndpointSlice"],
    "events.k8s.io/v1":["Event"],
    "networking.k8s.io/v1":["Ingress","NetworkPolicy"],
    "policy/v1":["PodDisruptionBudget"],
    "rbac.authorization.k8s.io/v1":["RoleBinding","Role"],
    "storage.k8s.io/v1":["CSIStorageCapacity"]
}
const clusteredResources = {
    "v1":["ComponentStatus","Namespace","Node","PersistentVolume"],
    "admissionregistration.k8s.io/v1":["MutatingWebhookConfiguration","ValidatingWebhookConfiguration"],
    "apiextensions.k8s.io/v1":["CustomResourceDefinition"],
    "apiregistration.k8s.io/v1":["APIService"],
    "certificates.k8s.io/v1":["CertificateSigningRequest"],
    "crd.projectcalico.org/v1":["BGPConfiguration","BGPPeer","BlockAffinity","CalicoNodeStatus","ClusterInformation","FelixConfiguration","GlobalNetworkPolicy","GlobalNetworkSet","HostEndpoint","IPAMBlock","IPAMConfig","IPAMHandle","IPPool","IPReservation","KubeControllersConfiguration"],
    "flowcontrol.apiserver.k8s.io/v1beta2":["FlowSchema","PriorityLevelConfiguration"],
    "internal.apiserver.k8s.io/v1alpha1":["StorageVersion"],
    "networking.k8s.io/v1":["networking.k8s.io/v1"],
    "node.k8s.io/v1":["RuntimeClass"],
    "policy/v1beta1":["PodSecurityPolicy"],
    "rbac.authorization.k8s.io/v1":["ClusterRoleBinding","ClusterRole"],
    "scheduling.k8s.io/v1":["PriorityClass"],
    "storage.k8s.io/v1":["CSIDriver","CSINode","StorageClass","VolumeAttachment"],
    "authentication.k8s.io": ["user","group"]
    
}

$:{
    readOnly =  verbs.every(elem => ["Get","Watch","List"].includes(elem))
}

let kindsAutoComplete = Object.values(namespacedResources).flat();
let apiextensionsAutoComplete = Object.keys(namespacedResources)

const resetAutoComplete = () => 
{
    if(isClusteredRole)
    {
        kindsAutoComplete = Object.values(clusteredResources).flat().concat(Object.values(namespacedResources).flat());
        apiextensionsAutoComplete = Object.keys(namespacedResources).concat(Object.keys(clusteredResources))
        
    }
    else
    {
        kindsAutoComplete = Object.values(namespacedResources).flat();
        apiextensionsAutoComplete = Object.keys(namespacedResources)
    }
}

roleObject.subscribe((value) => {
    if(isClusteredRole!=value.clustered)
    {
        isClusteredRole = value.clustered;
        resetAutoComplete()
    }
})

const mergedResources = () => {
    let dict = {...namespacedResources}
    Object.keys(clusteredResources).some((apiVersion) => {
        if(Object.keys(dict).includes(apiVersion))
        {
            dict[apiVersion] = dict[apiVersion].concat(clusteredResources[apiVersion])
        }
        else
        {
            dict[apiVersion] = clusteredResources[apiVersion]
        }
    })
    return dict

}


const handleKindInput = (event) => {
    kindsAutoComplete = [];
    let selectedResources = event.detail.tags
    let possibleOptions = {...namespacedResources}
    if(selectedResources.length == 0) {resetAutoComplete(); return}
    if(isClusteredRole) {possibleOptions = mergedResources()}
    let apiGroups = []
    selectedResources.some((resource) => {
        Object.keys(possibleOptions).some((apiVersion) => {
            if(possibleOptions[apiVersion].includes(resource) && !apiGroups.includes(apiVersion))
            {
                apiGroups.push(apiVersion)
            }
        })
    })
    apiGroups.some((apiVersion) => {
        kindsAutoComplete = kindsAutoComplete.concat(possibleOptions[apiVersion])
        if(!apiVersions.includes(apiVersion))
            apiVersions.push(apiVersion)
    })
}



</script>
    
<div class="rule">
    <span class="index">{index+1}</span>
    {#if readOnly}
    <span class="readOnly">Read-only </span>
    {/if}
    <div class="inputs">
        <div class="inputWrapper tagsWrapper">
        <label for="api-versions">Api Groups :</label>   
        <Tags
        autoComplete={apiextensionsAutoComplete}
        name="api-versions"
        bind:tags={apiVersions}
        placeholder="Detected by kind"
        />
    </div>
    <div class="inputWrapper tagsWrapper">
        <label for="kinds">Resources :</label>
        <Tags 
        name="kinds"
        on:tags={handleKindInput}
        autoComplete={kindsAutoComplete}
        bind:tags={kinds}
        />
    </div>
    <div class="inputWrapper">
    <label for="names">Resources Names:</label>
    <Tags 
    name="names"
    bind:tags={names}
    />
</div>
    <div class="resource-verbs">
        {#each verbsOptions as verb}
        <label for={verb}><input value={verb} bind:group={verbs} name={verb} type="checkbox">{verb}</label>
        {/each}
    </div>
</div>
    <button on:click={duplicateRule(index)} class="delete clear-btn" value="duplicate"><img src={Duplicate}></button>
    <button on:click={deleteRule(index)} class="clear-btn" value="delete"><img src={Delete}></button>
</div>
<style>

.rule{
    background: var(--default-wiget-background);
    display: flex;
    flex-direction: row;
    align-items: center;
    box-shadow: rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
    margin: 0.7rem auto;
    padding: 2rem 1rem;
    height: 10rem;
    box-sizing: border-box;
    opacity: 0.8;
    width: 100%;
    position: relative;
    justify-content: stretch;
    transition: opacity ease 250ms , box-shadow 500ms;
}
.rule:focus-within{
    opacity: 1;
    box-shadow: inset 18px 0 0px -14px var(--default-background-menu), rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
}

.index{
    position: absolute;
    left: 1rem;
    bottom:1rem;
    opacity: 0.4;
}

.rule *{
    font-family: Rubik;
}

.rule .inputs{
    display: flex;
    flex-basis: 100%;
}

*:focus{
    outline: none;
}

.rule .inputs > *{
    margin-right: 1rem;
}


.clear-btn{
    background: transparent;
    border: none;
    padding: 0.6rem;
    opacity: 0.3;
    border-radius: 50%;
}

.resource-verbs{
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
    margin-left: auto;
    margin-right: 0;
    width: 12rem;
}

.resource-verbs input, .resource-verbs label{
    display: inline;
    margin: 0.1rem;
}

.clear-btn:not(.upload):hover{
    background-color: rgb(250, 246, 246);
    opacity: 0.5;
    cursor: pointer;
}

.inputs :global(.svelte-tags-input-tag){
    background-color: rgb(212, 219, 241);
    color: black;
    font-family: Rubik;
    font-size: var(--default-text);
}

.inputs .inputWrapper{
    position: relative;
    display: flex;
    flex-direction: column;
}

.inputWrapper.tagsWrapper{
    display: block;
}

.inputs :global(.svelte-tags-input-matchs-parent)
{
    position: absolute;
    width: 100%;
    z-index: 1000;
}

.inputs :global(.svelte-tags-input-matchs){
    width: fit-content;
    left:0;
    cursor: pointer;
    overflow: auto;
    max-height: none;
}

.readOnly{
    color: #326de6;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 1rem;
    top:1rem;
    border: 1px solid #326de6;
    height: fit-content;
    width: fit-content;
    font-size: 0.8rem;
    border-radius: 8px;
    padding: 0.2rem;
}

</style>