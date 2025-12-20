# @opennotify/dashboard TODO

Technical debt and pending improvements.

---

## High Priority

- [ ] **Add form validation library** — Currently using basic controlled inputs. Consider React Hook Form for better validation UX.

- [ ] **Add error boundaries** — Catch React errors gracefully and show friendly error pages.

- [ ] **Implement loading skeletons** — Replace spinner with content-aware loading states.

---

## Medium Priority

- [x] **Add notification detail modal** — Click on notification row to see full details. *(Done in v0.2.0)*

- [ ] **Add toast notifications** — Show success/error messages for actions (connect provider, delete, etc.).

- [ ] **Add dark mode support** — Tailwind already supports it, need to add toggle.

- [ ] **Persist auth with secure cookie** — localStorage is vulnerable to XSS. Consider httpOnly cookie approach.

---

## Low Priority

- [ ] **Add keyboard shortcuts** — Quick navigation with keyboard.

- [ ] **Add i18n support** — Support for Russian/Uzbek languages.

- [ ] **Add mobile responsive improvements** — Sidebar as drawer on mobile.

- [ ] **Add provider status check** — Verify provider credentials are still valid.

---

## Technical Debt

- [ ] **Extract common components** — Button, Input, Modal components are duplicated.

- [ ] **Add unit tests** — Test API client, AuthContext, and form validation.

- [ ] **Add E2E tests** — Test critical flows: register, login, connect provider.

---

*Last updated: December 2025*
