import { createApp } from 'vue'
import Navbar from '../components/Partials/Navbar.vue'
import Footer from '../components/Partials/Footer.vue'
import Homepage from '../components/Homepage/Homepage.vue'
import Posts from '../components/Posts/Posts.vue'
import PostPage from '../components/Posts/PostPage.vue'
import Comments from '../components/Posts/Partials/Comments.vue'

const vScrollAnimate = {
    mounted(el, binding) {
        el.classList.add('before-animate')

        const threshold = binding.value?.threshold ?? 0.4
        const once = binding.value?.once ?? true

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add('animate')
                        el.classList.remove('before-animate')

                        if (once) {
                            observer.unobserve(el)
                        }
                    }
                })
            },
            { threshold }
        )

        observer.observe(el)
    },
};

const app = createApp({})
app.component('v-navbar', Navbar)
app.component('v-homepage', Homepage)
app.component('v-footer', Footer)
app.component('v-posts', Posts)
app.component('v-post', PostPage)

app.component('comments', Comments)

app.directive('scroll-animate', vScrollAnimate)

app.directive('highlight', {
  mounted(el) {
    el.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block)
    })
  },
  updated(el) {
    el.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block)
    })
  }
})


app.mount('#app')