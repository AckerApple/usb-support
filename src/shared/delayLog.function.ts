export default function delayLog(...args: any[]) {
setTimeout(() => console.log(...args), 300);
}
