<script setup lang="ts">
import gsap from 'gsap'

useSeoMeta({
  title: 'CV · Kevin Real Alejo',
  description: 'Résumé — full-stack engineer specialising in Spring Boot, AWS, and Nuxt.',
  ogTitle: 'CV · Kevin Real Alejo',
  ogDescription: 'Experience, skills, and education of Kevin Real Alejo, full-stack engineer.'
})

onMounted(() => {
  gsap.fromTo('.cv-head h1',  { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
  gsap.fromTo('.cv-head .role', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2 })
  gsap.fromTo('.cv-head .actions', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.35 })
  gsap.fromTo('.cv-section', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, stagger: 0.1 })
})
</script>

<template>
  <div class="shell cv-wrap">
    <div class="cv-head">
      <div class="cv-head-main">
        <h1>Kevin Real <br><em style="color:var(--accent);font-style:normal">Alejo</em></h1>
        <div class="role">Full-stack engineer · Madrid, ES</div>
        <div class="actions">
          <NuxtLink to="/contact" class="btn">Contact me</NuxtLink>
          <a href="https://github.com/krealalejo" target="_blank" rel="noopener" class="btn btn-ghost">GitHub ↗</a>
        </div>
      </div>
      <div class="cv-photo-wrap">
        <div class="hero-portrait" style="aspect-ratio:3/4;">
          <span class="corner tl" /><span class="corner tr" />
          <span class="corner bl" /><span class="corner br" />
          <div class="ph-center">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.2">
              <circle cx="22" cy="17" r="7" />
              <path d="M8 38c2-7 8-10 14-10s12 3 14 10" />
            </svg>
            <span>portrait.jpg</span>
          </div>
        </div>
        <div class="hero-portrait-meta">
          <span>Fig. 01 · self</span>
          <span>Madrid · 2026</span>
        </div>
      </div>
    </div>

    <section class="cv-section">
      <div class="title">Summary</div>
      <div>
        <p>Full-stack engineer focused on building robust, scalable systems that pair the power of the Java / Spring ecosystem with modern SSR frontends in Nuxt. Firm believer in Clean Architecture and Domain-Driven Design. My goal: turn complex problems into elegant solutions, optimised for the cloud with AWS and wired together through Terraform.</p>
      </div>
    </section>

    <section class="cv-section">
      <div class="title">Experience</div>
      <div>
        <div class="role-row">
          <div>
            <div class="rt">Sample Role · Company Name</div>
            <div class="rc">Madrid, ES · Full-time</div>
            <div class="rd">Led development of microservices on AWS, introduced DDD and Clean Architecture. Reduced deployment time by 40% with CI/CD pipelines in GitHub Actions. Migrated legacy monolith to event-driven architecture using SNS/SQS.</div>
          </div>
          <div class="ryears">2024 — Present</div>
        </div>
        <div class="role-row">
          <div>
            <div class="rt">Sample Role · Previous Company</div>
            <div class="rc">Remote · Full-time</div>
            <div class="rd">Built REST APIs with Spring Boot, deployed on EC2 / Lambda. Implemented observability with CloudWatch and structured logging. Collaborated closely with product to define domain boundaries.</div>
          </div>
          <div class="ryears">2022 — 2024</div>
        </div>
      </div>
    </section>

    <section class="cv-section">
      <div class="title">Skills</div>
      <div>
        <div class="skill-group">
          <h4>Backend</h4>
          <div class="skill-row">
            <span v-for="s in ['Java 21', 'Spring Boot 3', 'Spring Security', 'DDD', 'Clean Architecture', 'Event-driven']" :key="s" class="chip">{{ s }}</span>
          </div>
        </div>
        <div class="skill-group">
          <h4>Frontend</h4>
          <div class="skill-row">
            <span v-for="s in ['TypeScript', 'Nuxt 4', 'Vue 3', 'GSAP', 'CSS / Design systems']" :key="s" class="chip">{{ s }}</span>
          </div>
        </div>
        <div class="skill-group">
          <h4>Cloud & Infra</h4>
          <div class="skill-row">
            <span v-for="s in ['AWS', 'Terraform', 'DynamoDB', 'Lambda', 'EC2', 'SNS/SQS', 'CloudWatch']" :key="s" class="chip">{{ s }}</span>
          </div>
        </div>
        <div class="skill-group">
          <h4>Tooling</h4>
          <div class="skill-row">
            <span v-for="s in ['Git', 'GitHub Actions', 'Docker', 'IntelliJ IDEA', 'Postman']" :key="s" class="chip">{{ s }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="cv-section">
      <div class="title">Education</div>
      <div>
        <div class="role-row">
          <div>
            <div class="rt">Degree in Computer Engineering</div>
            <div class="rc">University / Institution Name</div>
            <div class="rd">Specialisation in software engineering, distributed systems, and cloud computing.</div>
          </div>
          <div class="ryears">2018 — 2022</div>
        </div>
      </div>
    </section>

    <section class="cv-section">
      <div class="title">Elsewhere</div>
      <div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:15px;color:var(--fg-dim);">
          <a href="https://github.com/krealalejo" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--fg-dim)'">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">GitHub</span>
            github.com/krealalejo ↗
          </a>
          <a href="https://www.linkedin.com/in/kevinrealalejo/" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--fg-dim)'">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">LinkedIn</span>
            linkedin.com/in/kevinrealalejo ↗
          </a>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">Email</span>
            hi@krealejo.dev
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">Location</span>
            Madrid, Spain · UTC+1
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@media (max-width: 700px) {
  .cv-head { grid-template-columns: 1fr !important; }
  .cv-photo-wrap { display: none !important; }
  .cv-section { grid-template-columns: 1fr !important; gap: 16px !important; }
}
</style>
