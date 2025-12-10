import { Plan } from "../../models/plan";

export type SortedInterface = "price" | "dataCap" | "speed";
export type OrderInterface = "min" | "max" ;


/**
 * Esta funcao realiza a ordenacao dos planos de acordo com o tipo do filtro (sorted) e a ordem selecionada order
 * @param plans 
 * @param sorted 
 * @param order 
 * @returns 
 */
export function orderPlans(plans: Plan[] | null, sorted?: SortedInterface, order?: OrderInterface ): Plan[] | null{
    if(sorted === undefined || plans === null) return plans;    
    return [...plans].sort((a,b)=> {

        const vlPrimary = a[sorted];
        const vlSecondary = b[sorted];

        if(typeof vlPrimary === "number" && typeof vlSecondary === "number") {
            if(order === "min" || order === undefined) return vlPrimary - vlSecondary

            return vlSecondary - vlPrimary
        };


        if(order === "min" || order === undefined) return convertTextSpeed(String(vlPrimary)) - convertTextSpeed(String(vlSecondary));
        
        return convertTextSpeed(String(vlSecondary)) - convertTextSpeed(String(vlPrimary));
    });
}



function convertTextSpeed(value: string): number{
    const num = parseInt(value.replace(/[^0-9]/g, ""));
    return value.toLowerCase().includes("gbps") ? num * 1024 : num;
}