const useDelay = (ms) =>{

const delay = () => new Promise(
  resolve => setTimeout(resolve, ms)
);

return {delay}
}

export default useDelay