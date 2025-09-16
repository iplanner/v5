import '@interactjs/auto-start'
import '@interactjs/actions/resize'
import '@interactjs/modifiers'
import '@interactjs/inertia'
import interact from '@interactjs/interact'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("resizable", {
    mounted: (el, binding) => {

      el.style.touchAction = "none";

      const updateInteractOptions = () => {

              if (!binding.instance?.resizable) return;

              const { minWidth = 100, minHeight = 50 } = binding.instance?.resizable ?? {};
              
              const options = {
                // resize from all edges and corners
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    start(event) {
                        binding.instance?.resizable?.onResizeStart?.(event);
                    },
                    move(event) {
        
                        var target = event.target
                        var x = (parseFloat(target.getAttribute('data-x')) || 0)
                        var y = (parseFloat(target.getAttribute('data-y')) || 0)
        
                        // update the element's style
                        target.style.width = event.rect.width + 'px'
                        target.style.height = event.rect.height + 'px'
        
                        // translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;
        
                        target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
        
                        target.setAttribute('data-x', x)
                        target.setAttribute('data-y', y)
        
                        binding.instance?.resizable?.onResizeMove?.(event);
        
                    },
                    end (event){
                        binding.instance?.resizable?.onResizeEnd?.(event);
                    }
                },
                modifiers: [
                    // keep the edges inside the parent
                    interact.modifiers.restrictEdges({
                        outer: 'parent'
                    }),
                    // minimum size
                    interact.modifiers.restrictSize({
                        min: { width: minWidth, height: minHeight }
                    })
                ],
                inertia: true
              }
        
              interact(el).resizable(false);
              interact(el).resizable(options);
      };

      watch(
        () => binding.instance?.resizable,
        (changed) => {
          if (changed) {
            if(changed?.disabled){
              interact(el).resizable(false);
            }else{
              updateInteractOptions();
            }
          } else {
            interact(el).resizable(false);
          }
        },
        { immediate: true, deep: true }
      );


    },
    unmounted: (el) => {
      interact(el).resizable(false);
    },
    getSSRProps(binding, vnode) {
      return {};
    },
  });

});

