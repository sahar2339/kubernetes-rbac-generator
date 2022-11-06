<script>
    import warning from '../assets/warning.svg';
    import info from '../assets/info.svg';
    export let clusterRole;
    export let rules;
    export let namespace;
    let tips = [];

    const TipsIcon = {
        "info": info,
        "warning": warning
    }

    const tipsOptions = [
        {"id":1,"resources":["Secret"], "apiGroups":["v1"],"verbs":["Get","List"],"resourceNames":[],"detail":"Role can read Secrets","type":"warning"},
        {"id":2,"resources":["Pod"], "apiGroups":["v1"],"verbs":["Create","Update"],"resourceNames":[],"namespace":["kube-system"],"detail":"role can create privillged pod", "type":"warning"},
        {"id":3,"resources":["nodes/proxy"], "apiGroups":["v1"],"verbs":["Create"],"resourceNames":[],"detail":"direct access to the Kubelet","type":"warning"}
    ]




$:{
    tips = [];
    let stringRules = []
    let roleIsReadOnly = true
    rules.some((rule, idx) => {
        if(!rule.verbs.every(elem => ["Get","Watch","List"].includes(elem))) {roleIsReadOnly = false}      
        tipsOptions.some((tipCondition) => {
            let isConditionValidated = true;
            ["resources","apiGroups","verbs","resourceNames"].some((field) => {
                let isFieldValidated = false
                if(tipCondition[field].length == 0){isFieldValidated=true; return}
                tipCondition[field].some((option)=> {
                    if(rule[field].includes(option) || rule[field].includes("*")) 
                        {isFieldValidated = true}
                })
                if(!isFieldValidated)
                    {
                        isConditionValidated = false
                        return
                    } 
            })
            if(tipCondition["namespace"])
            {
                isConditionValidated = (isConditionValidated&&(clusterRole||tipCondition["namespace"].includes(namespace)))
            }
            if(isConditionValidated && !(tipCondition.id in tips))
                tips.push({"index":idx, "detail":tipCondition.detail, "type":tipCondition.type, "id":tipCondition.id})
        })
        if(stringRules.includes(JSON.stringify(rule)))
            tips.push({"index":idx, "detail":"Rule is duplicated", "type":"info"})
        else if(rule.resources.length > 0)
            stringRules.push(JSON.stringify(rule))

    })
    if(roleIsReadOnly)
    {
        tips.push({"index":0, "detail":"Role Is Read Only", "type":"info"})
    }
}

</script>
<span class="Headline">{tips.length} Role Insights</span>
<div class="roleTips">
    {#each tips as tip}
    <div class="tip {tip.type}"><img src={TipsIcon[tip.type]}/>{tip.detail}</div>
    {/each}
</div>
<style>
.roleTips{
    display: flex;
    flex-direction: column;
    margin: 0.5rem 5%;
    height: 12rem;
    border: 1px solid rgb(209, 209, 209);
    background-color: var(--default-background);
    width: 90%;
}

.tip{
    width: 100%;
    height: 3rem;
    display: flex;
    border-left: 3px solid rgb(255, 8, 0);
    background-color: white;
    box-sizing: border-box;
    position: relative;
    opacity: 0.8;
    color: rgb(73, 73, 73);
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid rgb(209, 209, 209);
}

.tip:hover{
    opacity: 1;
    cursor: pointer;
}
.tip.info{
    border-left: 3px solid rgb(91, 74, 243);
}

.tip img{
    position: absolute;
    left: 1rem;
    height: 1.5rem;
    opacity: 0.5;
}


.Headline{
    font-size: 1.2rem;
    margin: 1rem auto;
}
</style>