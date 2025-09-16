import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/inertia";
import interact from "@interactjs/interact";


export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("draggable", {
    mounted: (el, binding) => {
      el.style.touchAction = "none";

      let interactable = interact(el);

      const updateInteractOptions = () => {
        
        if (!binding.instance?.draggable) return;

        const {
          restriction = { restriction: "#__nuxt", endOnly: true },
          lockAxis = null,
          snap = null,
          inertia = true,
        } = binding.instance.draggable;

        const options = {
          cursorChecker: () => "grab",
          inertia: inertia,
          autoScroll: true,
          ignoreFrom: '.window-no-drag',
          modifiers: [
            interact.modifiers.restrictRect(restriction),
            ...(snap ? [interact.modifiers.snap(snap)] : []),
          ],
          listeners: {
            start(event) {
              event.target.style.cursor = "grabbing";
              binding.instance?.draggable?.onDragStart?.(event);
            },
            move(event) {
              const target = event.target;
              target.style.cursor = "grabbing";

              let x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
              let y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

              target.style.transform = `translate(${x}px, ${y}px)`;
              target.setAttribute("data-x", x);
              target.setAttribute("data-y", y);

              binding.instance?.draggable?.onDragMove?.(event);
            },
            end(event) {
              event.target.style.width = `${event.rect.width}px`;
              event.target.style.height = `${event.rect.height}px`;

              binding.instance?.draggable?.onDragEnd?.(event);
            },
          },
          lockAxis,
        };

        interactable.draggable(false);
        interactable.draggable(options);
      };

      watch(
        () => binding.instance?.draggable,
        (changed) => {
          if (changed) {
            if(changed?.disabled){
              interactable.draggable(false);
            }else{
              updateInteractOptions();
            }
          } else {
            interactable.draggable(false);
          }
        },
        { immediate: true, deep: true }
      );
    },

    unmounted: (el) => {
      interact(el).draggable(false);
    },

    getSSRProps(binding, vnode) {
      return {};
    },
  });
});
