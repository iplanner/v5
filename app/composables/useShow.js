
export function useShow() {
    
    const show = ref(false);
    let resolver = null;

    function open() {
        show.value = true;

        return new Promise((resolve) => {
            resolver = resolve;
        });
    }

    function resolve(result) {
        show.value = false;
        if (resolver) {
            resolver(result);
            resolver = null;
        }
    }

    return {
        show,
        open,
        onResolve: () => resolve(true),  
        onReject: () => resolve(false)
    };
}