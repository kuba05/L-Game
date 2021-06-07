export interface AI {
    query: (array: number[]) => number[];
    copy: () => AI;
    mutate: (y: (x:any)=>any) => any;
}