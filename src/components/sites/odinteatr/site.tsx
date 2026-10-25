"use client";
import legal from "../../../../content/legal.json";
import pages from "../../../../content/pages.json";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { siteContent as content, plays, people, ui, numberedLabel } from "@/lib/content";
const navigation = ui.navigation.map(({ label, href }) => [label, href]);
const paragraph = content.intro;
const brandWords = content.brand.trim().split(/\s+/);
const brandName = brandWords[brandWords.length - 1];
const brandPrefix = brandWords.slice(0, -1).join(" ");
function Media({ label, image = "", className = "" }: {
  label: string;
  image?: string;
  className?: string;
}) {
  return <div className={"media " + className} style={image ? { backgroundImage: 'url("' + image + '")' } : undefined} role="img" aria-label={label}>{!image && <span><i aria-hidden="true"/>{label}</span>}</div>;
}
export function Header({ route }: {
  route: string;
}) {
  return <header className="site-header"><nav className="header-inner" aria-label={ui.common.mainNavigation}><Link className="brand-mark" href="/" aria-label={ui.common.home}><Image src={content.media.logo} alt="" width={48} height={48} sizes="(max-width: 600px) 32px, 48px" /></Link>{navigation.map(([name, href]) => <Link key={href} href={href} aria-current={"/" + route === href ? "page" : undefined}>{name}</Link>)}</nav></header>;
}
function Socials() { return <div className="socials" aria-label={ui.contacts.socialsLabel}><Link href="/contacts" aria-label={ui.contacts.messenger}>↗</Link><Link href="/contacts" aria-label={ui.contacts.video}>▶</Link><Link href="/contacts" aria-label={ui.contacts.network}>{ui.contacts.networkText}</Link></div>; }
function ContactGrid() { return <div className="contact-grid">{[[ui.contacts.phone, content.phone], [ui.contacts.hours, content.hours], [ui.contacts.email, content.email], [ui.contacts.address, content.address]].map(([label, value]) => <div key={label}><p>{label}</p><span>{value}</span></div>)}</div>; }
export function Footer({ full = false, partners = false }: {
  full?: boolean;
  partners?: boolean;
}) {
  return <footer><nav className="footer-nav" aria-label={ui.common.footerNavigation}><Link href="/">{ui.common.footerHome}</Link><Link href="/#afisha">{ui.common.afisha}</Link>{navigation.map(([name, href]) => <Link key={href} href={href}>{name}</Link>)}</nav>{partners && <div className="residence-link"><Link href="/krasnodar1">{ui.common.residence}</Link></div>}{full && <div className="footer-contacts wrap"><ContactGrid /><Socials /></div>}{partners && <div className="partners"><p>{ui.common.partners}</p><div>{Array.from({ length: 13 }, (_, i) => <span key={i}>{ui.common.partner} {i + 1}</span>)}</div><small>{ui.common.credits}</small></div>}<nav className="footer-legal" aria-label={legal.footerLabel}>{Object.entries(legal.pages).map(([slug, page]) => <Link key={slug} href={"/" + slug}>{page.title}</Link>)}</nav></footer>;
}
function TicketButton({ children = ui.tickets.button, className = "" }: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <button className={"pill " + className} onClick={() => window.dispatchEvent(new Event("open-tickets"))}>{children}</button>;
}
function TicketDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const open = () => { if (!dialog.current?.open)
    dialog.current?.showModal(); }; window.addEventListener("open-tickets", open); return () => window.removeEventListener("open-tickets", open); }, []);
  return <dialog ref={dialog} className="ticket-dialog" onClick={e => { if (e.target === e.currentTarget)
    dialog.current?.close(); }}><button className="close" aria-label={ui.tickets.close} onClick={() => dialog.current?.close()}>×</button><h2>{ui.tickets.title}</h2><p>{ui.tickets.description}</p><p>{ui.tickets.contactPrefix} {content.phone}</p><button className="pill" onClick={() => dialog.current?.close()}>{ui.tickets.confirm}</button></dialog>;
}
function Home() {
  const [slide, setSlide] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setSlide(s => (s + 1) % 3), 6500); return () => window.clearInterval(timer); }, []);
  return <><main><section className="home-hero"><Media label={pages.homeHeroImage} image={content.media.homeHero} className="hero-media"/><h1 className="hero-wordmark" aria-label={content.brand}><span className="hero-wordmark-prefix">{brandPrefix}</span>{" "}<span className="hero-wordmark-name">{brandName}</span></h1><div className="hero-bottom wrap"><div className="hero-phone">{pages.homePhone}<br /><span>{content.phone}</span><br />{pages.homeHours}</div><div className="hero-actions"><a className="pill" href="#afisha">{pages.homeAfisha}</a><Link href="/contacts" className="consultant">{pages.homeConsultant}</Link></div><Socials /></div></section><section className={"home-promo promo-" + slide} aria-roledescription={pages.homeCarousel}><Media label={pages.homeBannerImage + " " + (slide + 1)} image={content.media.promos[slide]}/><div className="promo-content"><p>{pages.homePremiere}</p><h2>{plays[slide].title}</h2><p>{plays[slide].scheduleLabel}</p><TicketButton>{pages.homeAllTickets}</TicketButton></div><div className="slider-controls"><button aria-label={pages.homePreviousBanner} onClick={() => setSlide((slide + 2) % 3)}>‹</button>{[0, 1, 2].map(i => <button className={i === slide ? "selected" : ""} key={i} aria-label={pages.homeBanner + " " + (i + 1)} aria-pressed={slide === i} onClick={() => setSlide(i)}>•</button>)}<button aria-label={pages.homeNextBanner} onClick={() => setSlide((slide + 1) % 3)}>›</button></div></section><section className="afisha" id="afisha"><h2>{pages.homeAfishaTitle}</h2><div className="offer"><div className="offer-badge" aria-hidden="true">✳</div><p>{pages.homeOffer}</p><TicketButton>{pages.homeOfferTickets}</TicketButton></div><div className="schedule-space" aria-label={pages.homeSchedulePlaceholder}/></section></main><Footer full partners/></>;
}
function Plays() { return <><main className="plays-list">{plays.map((play, i) => <Link className={"play-strip strip-" + i % 5} key={play.slug} href={"/" + play.slug}><Media label={ui.plays.image} image={play.image}/><h2>{play.title}</h2></Link>)}</main><Footer full/></>; }
function Team() { return <><main className="team-grid wrap">{people.map((person, i) => <Link key={person.slug} className={"polaroid person-" + i} href={"/" + person.slug}><Media label={ui.people.portrait} image={person.image}/><span>{person.name}</span></Link>)}</main><Footer /></>; }
function Faq() { return <><main className="faq-list"><h1 className="sr-only">{pages.faqTitle}</h1>{content.faq.map(item => <details key={item.title}><summary>{item.title}<span className="plus"/></summary><div className="faq-answer"><p>{item.text}</p>{item.media && <Media label={pages.faqGiftImage}/>}<Link href="/contacts">{pages.faqContacts}</Link></div></details>)}</main><Footer /></>; }
function Theatre() { return <><main className="theatre-story">{[pages.theatreAbout, pages.theatreMission, pages.theatreAudience].map((title, i) => <section className={"story-panel story-" + i} key={title}><div className="story-sticky"><Media label={pages.theatreImage + " " + (i + 1)} image={content.media.theatre[i]}/><div className="story-copy"><h1 className={i ? "sr-only" : ""}>{title}</h1><p>{paragraph}</p></div></div></section>)}<Media className="story-closing" image={content.media.theatre[3]} label={pages.theatrePanorama}/></main><Footer /></>; }
function Contacts() { return <><main className="contacts-page wrap"><h1>{pages.contactsTitle}</h1><div className="contacts-columns"><div>{[pages.contactsTouring, pages.contactsPartners, pages.contactsRental].map((label, i) => <section key={label}><h2>{label}</h2><p>{pages.contactsPersonName} <span>{i === 0 ? content.email : content.phone}</span></p>{i === 2 && <Link className="pill" href="/arenda">{pages.contactsRentalPage}</Link>}</section>)}</div><div className="contact-sidebar"><ContactGrid /><Socials /></div></div></main><Footer /></>; }
function Gallery({ images = Array<string>(12).fill("") }: {
  images?: string[];
}) {
  const count = images.length;
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => { dialog.current?.close(); setActive(null); };
  return <><div className="photo-grid" id="photos">{Array.from({ length: Math.ceil(count / 3) }, (_, row) => <div className={"gallery-row " + (row % 2 ? "reverse " : "") + (count - row * 3 < 3 ? "partial" : "")} key={row}>{images.slice(row * 3, row * 3 + 3).map((image, offset) => { const i = row * 3 + offset; return <button key={i} onClick={() => { setActive(i); dialog.current?.showModal(); }} aria-label={numberedLabel(ui.gallery.open, i + 1)}><Media label={numberedLabel(ui.gallery.photo, i + 1)} image={image}/></button>; })}</div>)}</div><dialog className="gallery-dialog" ref={dialog} onCancel={() => setActive(null)} onClick={e => { if (e.target === e.currentTarget)
    close(); }}><button className="close" aria-label={ui.gallery.close} onClick={close}>×</button><Media label={numberedLabel(ui.gallery.photo, (active ?? 0) + 1)} image={images[active ?? 0]}/><div className="gallery-controls"><button onClick={() => setActive(((active ?? 0) - 1 + count) % count)} aria-label={ui.gallery.previous}>←</button><span>{(active ?? 0) + 1} / {count}</span><button onClick={() => setActive(((active ?? 0) + 1) % count)} aria-label={ui.gallery.next}>→</button></div></dialog></>;
}
function PlayDetail({ slug }: {
  slug: string;
}) {
  const play = plays.find(item => item.slug === slug)!;
  return <><main>
  <section className="detail-hero">
   <Media label={ui.plays.heroImage} image={play.image}/>
   <div className="detail-title"><p>{play.subtitle}</p><h1>{play.title}</h1><TicketButton /></div>
   <nav className="detail-nav" aria-label={ui.plays.navigation}><a href="#about">{ui.plays.aboutNav}</a><a href="#cast">{ui.plays.cast}</a><a href="#photos">{ui.plays.photos}</a></nav>
   <p className="detail-intro">{play.description}</p><span className="age">{play.ageRating}</span>
  </section>
  <section id="about" className="play-about"><h2>{ui.plays.aboutTitle}</h2>{play.about.paragraphs.map((text, i) => <p key={i}>{text}</p>)}<blockquote>{play.about.quote}</blockquote><TicketButton>{ui.tickets.attend}</TicketButton></section>
  <section className="trailer wrap"><Media label={ui.plays.trailer}/></section>
  <Gallery images={play.gallery}/>
  <section id="cast" className="cast wrap"><h2>{ui.plays.cast}</h2>{play.cast.map((member, i) => {
      const person = people.find(item => item.slug === member.personSlug);
      return person ? <div key={member.personSlug + i}><span>{member.role}</span><Link href={"/" + person.slug}>{person.name}</Link></div> : null;
    })}</section>
  <section className="production-note wrap"><p>{play.productionNote}</p><span>{play.ageRating}</span></section>
 </main><Footer /></>;
}
function PersonDetail({ slug }: {
  slug: string;
}) {
  const person = people.find(item => item.slug === slug)!;
  return <><main><section className="person-page wrap"><Media label={ui.people.portraitDetail} image={person.image}/><div><h1>{person.name}</h1><h2>{person.role}</h2><p>{person.bio}</p><p>{ui.people.relatedPlays}</p><div className="person-plays">{person.playSlugs.map(playSlug => {
      const play = plays.find(item => item.slug === playSlug);
      return play ? <Link key={play.slug} href={"/" + play.slug}>{play.title}</Link> : null;
    })}</div></div></section><Gallery images={person.gallery}/></main><Footer /></>;
}
function Rental() { return <><main><section className="rental-hero"><Media label={pages.rentalImage} image={content.media.rental}/><h1>{pages.rentalTitle}</h1><a href="#rental-info" className="down-link" aria-label={pages.rentalPriceTitle}>↓</a></section><section id="rental-info" className="rental-info wrap"><h2>{pages.rentalPriceTitle}</h2><div className="rental-columns"><div><h3>{pages.rentalRoom}</h3><ul>{[pages.rentalSpace, pages.rentalDressingRoom, pages.rentalStage, pages.rentalSound, pages.rentalLight, pages.rentalCleaning, pages.rentalAdministrator].map(x => <li key={x}>{x}</li>)}</ul></div><div><h3>{pages.rentalExtras}</h3><ul><li>{pages.rentalDecorations}</li><li>{pages.rentalProjector}</li><li>{pages.rentalEquipment}</li></ul><p>{pages.rentalTerms} {content.phone}</p><Link href="/contacts" className="pill">{pages.rentalContact}</Link></div></div></section></main><Footer /></>; }
function Residence() { return <><main className="residence"><section className="residence-hero"><Media label={pages.residenceCover} image={content.media.residence}/><div><p>{ui.common.residence}</p><h1>{pages.residenceTitle}</h1><a className="pill" href="#application">{pages.residenceJoin}</a></div></section><section className="residence-copy wrap"><h2>{pages.residenceAbout}</h2><p>{paragraph}</p></section><Media className="residence-photo" label={pages.residenceImage}/><section className="residence-copy wrap"><h2>{pages.theatreAbout}</h2><p>{paragraph}</p></section><Gallery images={Array<string>(6).fill("")}/><section className="residence-copy wrap"><h2>{pages.residenceProcess}</h2><ol>{[pages.residenceSelection, pages.residenceRehearsals, pages.residenceShow, pages.residenceFeedback, pages.residenceMeetings].map(x => <li key={x}>{x}</li>)}</ol></section><section className="residence-copy wrap"><details><summary>{pages.residenceRules}</summary><p>{paragraph}</p></details></section><div className="partners"><p>{pages.residencePartners}</p><div>{[1, 2, 3, 4].map(i => <span key={i}>{pages.residencePartner} {i}</span>)}</div></div><section id="application" className="residence-copy wrap"><h2>{pages.residenceParticipation}</h2><p>{pages.residenceApplication}</p><Link className="pill" href="/contacts">{pages.residenceOrganizers}</Link></section></main><Footer /></>; }
export function TheatreSite({ route }: {
  route: string;
}) {
  let page;
  switch (route) {
    case "":
      page = <Home />;
      break;
    case "plays":
      page = <Plays />;
      break;
    case "we":
      page = <Team />;
      break;
    case "faq":
      page = <Faq />;
      break;
    case "theatre":
      page = <Theatre />;
      break;
    case "contacts":
      page = <Contacts />;
      break;
    case "arenda":
      page = <Rental />;
      break;
    case "krasnodar1":
      page = <Residence />;
      break;
    default: page = plays.some(p => p.slug === route) ? <PlayDetail slug={route}/> : <PersonDetail slug={route}/>;
  }
  return <><Header route={route}/>{page}<TicketDialog /><a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="back-top" aria-label={ui.common.backTop}>↑</a></>;
}
