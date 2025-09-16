

export default defineEventHandler( async event => {

    const config = useRuntimeConfig(event);
    const { session } = event.context;

    try {

        const list = [
            /* { "salutation": "Sehr geehrter Herr Leier", "to": "helmut.leier@gmail.com" },
            { "salutation": "Sehr geehrter Herr Fischer", "to": "m.fischer@hplan.de" },
            { "salutation": "Sehr geehrter Herr Stuckart", "to": "gs@skb-assekuranz.de" },
            { "salutation": "Sehr geehrter Herr Esterl", "to": "stephan.esterl@versicherung-online.de" },
            { "salutation": "Sehr geehrter Herr Kolwe", "to": "kolwe@premiumversorgung.de" },
            { "salutation": "Sehr geehrter Herr Stein", "to": "info@finance-networks.de" },
            { "salutation": "Sehr geehrter Herr Butters", "to": "mb@finanzchecks.de" },
            { "salutation": "Sehr geehrter Herr Pelz", "to": "christof.pelz@invaria.de" },
            { "salutation": "Sehr geehrter Herr Bitz", "to": "bitz@s5-finanzpartner.de" },
            { "salutation": "Sehr geehrter Herr Hockauf", "to": "info@rene-hockauf.de" },
            { "salutation": "Sehr geehrter Herr Fünkner", "to": "info@tkm-tbb.de" },
            { "salutation": "Sehr geehrter Herr Schweigert", "to": "info@muenchen-assekuranz.de" },
            { "salutation": "Sehr geehrte Frau Ziegler", "to": "alexandra.ziegler@fg-finanz-service.de" },
            { "salutation": "Sehr geehrter Herr Hegers", "to": "christian.hegers@hegers-finanzen.de" },
            { "salutation": "Sehr geehrter Herr Schäfer", "to": "david.schaefer@fvmakler.com" },
            { "salutation": "Sehr geehrter Herr Samy", "to": "o.samy@fg-investment.eu" },
            { "salutation": "Sehr geehrter Herr Krasna", "to": "krasna@v-makler.net" },
            { "salutation": "Sehr geehrter Herr Hesse", "to": "t.hesse@makler-hesse.de" },
            { "salutation": "Sehr geehrter Herr Bauer", "to": "mail@makler.co" },
            { "salutation": "Sehr geehrte Frau Schüller", "to": "madeleine.schueller@schuellerundcie.de" },
            { "salutation": "Sehr geehrter Herr Wimmer", "to": "michael.wimmer@vervisio.de" },
            { "salutation": "Sehr geehrter Herr Schröder", "to": "peter.schroeder@finforyou.de" },
            { "salutation": "Sehr geehrter Herr Rauber", "to": "oliver.rauber@finanzkontor-rkm.com" },
            { "salutation": "Sehr geehrter Herr Gruner", "to": "oliver.gruner@optimum4you.de" },
            { "salutation": "Sehr geehrter Herr Schiener", "to": "info@schiener-online.de" },
            { "salutation": "Sehr geehrter Herr Schulz", "to": "d.schulz@hannover.creditreform.de" },
            { "salutation": "Sehr geehrter Herr Grommek", "to": "gg@dasfinanzwerk.com" },
            { "salutation": "Sehr geehrter Herr Becker", "to": "j.becker@fiba-kredit.de" },
            { "salutation": "Sehr geehrter Herr Bruckner", "to": "sb@bruckner-kollegen.de" },
            { "salutation": "Sehr geehrter Herr Kirchhain", "to": "axel.kirchhain@mkn-finanzen.de" },
            { "salutation": "Sehr geehrter Herr Kellhammer", "to": "Helmut.Kellhammer@ionk.de" },
            { "salutation": "Sehr geehrter Herr Matthes", "to": "info@koelner-vm.de" },
            { "salutation": "Sehr geehrter Herr Baer", "to": "g.baer@mehrwert-finanzen.de" },
            { "salutation": "Sehr geehrter Herr Porta", "to": "j.porta@bmv-institut.de" },
            { "salutation": "Sehr geehrter Herr Tornow", "to": "karsten.tornow@finanzengel.de" },
            { "salutation": "Sehr geehrter Herr Sturm", "to": "michael.sturm@finanzelfen.de" },
            { "salutation": "Sehr geehrter Herr Glaesker", "to": "glaesker@pvf-finanzen.de" },
            { "salutation": "Sehr geehrter Herr Lagaipa", "to": "gerlando@lagaipa.de" },
            { "salutation": "Sehr geehrter Herr Schoof", "to": "steffen.schoof@vb-select.de" },
            { "salutation": "Sehr geehrter Herr Orzschig", "to": "j.orzschig@vmjo.de" },
            { "salutation": "Sehr geehrter Herr Gasmi", "to": "sabri.gasmi@tes-finanz.de" },
            { "salutation": "Sehr geehrter Herr Keim", "to": "mail@e-c-o.info" },
            { "salutation": "Sehr geehrter Herr Reichert", "to": "michael.reichert@berensundcie.de" },
            { "salutation": "Sehr geehrter Herr Salomon", "to": "sven.salomon@klugversichert.de" },
            { "salutation": "Sehr geehrter Herr Karaman", "to": "kk@smartfinanziert.de" },
            { "salutation": "Sehr geehrter Herr Prestel", "to": "guido.prestel@gpundf.de" },
            { "salutation": "Sehr geehrte Frau George", "to": "post@gevoma.de" },
            { "salutation": "Sehr geehrter Herr Rauch", "to": "info@bvs-finanz.de" },
            { "salutation": "Sehr geehrter Herr Spiller", "to": "markus.spiller@everest-versicherungsmakler.de" },
            { "salutation": "Sehr geehrter Herr Martin", "to": "martin@versicherdich.de" },
            { "salutation": "Sehr geehrter Herr Frick", "to": "info@fr-versicherungsmakler.de" },
            { "salutation": "Sehr geehrte Frau Goetz", "to": "mail@versicherungsmakler-goetz.de" },
            { "salutation": "Sehr geehrter Herr Mpala", "to": "mpala@proselecta.de" },
            { "salutation": "Sehr geehrter Herr Ahner", "to": "thomas.ahner@finanzteam.de" },
            { "salutation": "Sehr geehrter Herr Ivakovic", "to": "ivakovic@di-w.de" },
            { "salutation": "Sehr geehrter Herr Atzinger", "to": "c.atzinger@confilias.de" },
            { "salutation": "Sehr geehrter Herr Kadel", "to": "manfred.kadel@kadel-vm.de" },
            { "salutation": "Sehr geehrter Herr Bucciarelli", "to": "patrick.bucciarelli@vsz.swiss" },
            { "salutation": "Sehr geehrter Herr Tasdereli", "to": "k.tasdereli@solarwerke-deutschland.de" },
            { "salutation": "Sehr geehrter Herr Lenert", "to": "kontakt@maklerservice-lenert.de" },
            { "salutation": "Sehr geehrter Herr Krumbachner", "to": "info@bergwerte.de" },
            { "salutation": "Sehr geehrter Herr Blazevski", "to": "sb@geldwerk.com" },
            { "salutation": "Sehr geehrter Herr Beckmann", "to": "ralf.beckmann@beckmann-versicherung.de" },
            { "salutation": "Sehr geehrter Herr Jung", "to": "moritz.jung@innofima.de" },
            { "salutation": "Sehr geehrter Herr Santen", "to": "m.santen@fdnord.de" },
            { "salutation": "Sehr geehrter Herr Zabold", "to": "k.zabold@die-werteschoepfer.de" },
            { "salutation": "Sehr geehrter Herr Fischer", "to": "info@premius-makler.de" },
            { "salutation": "Sehr geehrter Herr Keil", "to": "m.keil@birk-partner.de" },
            { "salutation": "Sehr geehrter Herr Örtel", "to": "hans-juergen.oertel@blickpunkt-finanz.de" },
            { "salutation": "Sehr geehrter Herr Bieger", "to": "pb@versicherungen-emobil.de" },
            { "salutation": "Sehr geehrter Herr Wilnauer", "to": "dw@wilnauer.de" },
            { "salutation": "Sehr geehrter Herr Morosini", "to": "info@mmm-agentur.com" },
            { "salutation": "Sehr geehrter Herr Mathias", "to": "mathias@f-vm.de" },
            { "salutation": "Sehr geehrter Herr Wittich", "to": "olaf.wittich@wittich-hd.de" },
            { "salutation": "Sehr geehrter Herr Kaiser", "to": "m.kaiser@cfl24.de" },
            { "salutation": "Sehr geehrter Herr Piotrowski", "to": "info@private-renten.de" },
            { "salutation": "Sehr geehrter Herr Eger", "to": "andre.eger@uni-force.de" },
            { "salutation": "Sehr geehrter Herr Lorenz", "to": "info@versicherungsbuero-lorenz.de" },
            { "salutation": "Sehr geehrte Frau Salomon", "to": "claudia.salomon@klugversichert.de" },
            { "salutation": "Sehr geehrter Herr Teterra", "to": "marcus.teterra@finartis.de" },
            { "salutation": "Sehr geehrte Frau Strobel", "to": "tanja.strobel@ra-maklerverbund.de" },
            { "salutation": "Sehr geehrter Herr Schreiner", "to": "A.Schreiner@schreiner-versicherungen.de" },
            { "salutation": "Sehr geehrter Herr Dauer", "to": "mail@dauer-makler.de" },
            { "salutation": "Sehr geehrter Herr Mehrens", "to": "daniel@mehrens-makler.de" },
            { "salutation": "Sehr geehrter Herr Ogiermann", "to": "m.ogiermann@valuefinance.de" },
            { "salutation": "Sehr geehrter Herr Bardt", "to": "info@uwe-bardt.de" },
            { "salutation": "Sehr geehrter Herr Dr. Merker", "to": "info@Dr-Merker.de" },
            { "salutation": "Sehr geehrter Herr Marschner", "to": "info@marschner-versichert.de" },
            { "salutation": "Sehr geehrter Herr Winands", "to": "winands@winands-makler.de" },
            { "salutation": "Sehr geehrter Herr Ermer", "to": "r.ermer@holfelder-schuessel.de" },
            { "salutation": "Sehr geehrter Herr Weinoehl", "to": "weinoehl@deinedigibox.de" },
            { "salutation": "Sehr geehrter Herr Guggemos", "to": "guggemos@fibeco-gmbh.de" },
            { "salutation": "Sehr geehrter Herr Bichler", "to": "info@bvb-netz.de" },
            { "salutation": "Sehr geehrte Frau Deegen", "to": "jana.deegen@hfk-rothenbaum.de" },
            { "salutation": "Sehr geehrter Herr Kluwe", "to": "christopher.kluwe@aruna.de" },
            { "salutation": "Sehr geehrter Herr Dorio", "to": "info@dorio-versicherungsmakler.de" },
            { "salutation": "Sehr geehrter Herr Schmeisser", "to": "a.schmeisser@pension-secur.de" },
            { "salutation": "Sehr geehrter Herr Nagel", "to": "Maklerservice.bb@gmail.com" },
            { "salutation": "Sehr geehrter Herr Adermann", "to": "Stefan.adermann@vmk-berlin.de" },
            { "salutation": "Sehr geehrter Herr Hueser", "to": "g.hueser@fair-abgesichert.de" },
            { "salutation": "Sehr geehrte Frau Witzl", "to": "lydia.witzl@we-finanz.de" },
            { "salutation": "Sehr geehrter Herr Haertl", "to": "christoph.haertl@prob-finanz.de" },
            { "salutation": "Sehr geehrter Herr Nolte", "to": "info@nofin.de" },
            { "salutation": "Sehr geehrter Herr Meierin", "to": "l.meierin@vers-kompass.de" },
            { "salutation": "Sehr geehrte Frau Hübner", "to": "karin.huebner@vfkh.de" },
            { "salutation": "Sehr geehrter Herr Heide", "to": "thomas@heideundheide.de" },
            { "salutation": "Sehr geehrter Herr Lohse", "to": "wirtschaftskanzlei@uwe-lohse.com" },
            { "salutation": "Sehr geehrter Herr Drtina", "to": "info@finally-gmbh.de" },
            { "salutation": "Sehr geehrter Herr Kappi", "to": "juergen-kappi@t-online.de" },
            { "salutation": "Sehr geehrter Herr Hilscher", "to": "matthias.hilscher@vmakler.info" },
            { "salutation": "Sehr geehrter Herr Scholz", "to": "steffen.scholz@finanz-service-institut.de" },
            { "salutation": "Sehr geehrter Herr Geiger", "to": "marcel.geiger@vc24.de" },
            { "salutation": "Sehr geehrter Herr Grüning", "to": "thomas.gruening@falcfinance.de" }
            { "salutation": "Sehr geehrter Herr Ritter", "to": "ritter@ritter-evers.de" },
            { "salutation": "Sehr geehrter Herr Raik", "to": "raik@MeinBackoffice.com" },
            { "salutation": "Sehr geehrter Herr Rabel", "to": "m.rabel@versicherungsplan.com" },
            { "salutation": "Sehr geehrter Rosenkranz", "to": "service@linie1.info" },
            { "salutation": "Sehr geehrter Herr Akbarpour", "to": "nima.akbarpour@ifs-finance.de" },
            { "salutation": "Sehr geehrte Frau Hanke", "to": "h.hanke@wertenburg.li" },
            { "salutation": "Sehr geehrter Herr Sackewitz", "to": "rs@finanzmakler-dessau.de" },
            { "salutation": "Sehr geehrter Herr Bitner", "to": "a.bitner@diw-institut.de" },
            { "salutation": "Sehr geehrter Herr Liebich", "to": "info@maklerei-liebich.de" },
            { "salutation": "Sehr geehrte Damen und Herren", "to": "mail@falcimmo.de" }*/
        ];

    for (const { to, salutation } of list) {
        
   /*      await useSendgrid({
            from: { name: 'Helmut Leier', email: 'helmut.leier@i-planner.de' },
            to: [{ email: to }],
            templateId: 'd-5eec923b2378403cb2980cebad45cd41',
            dynamicTemplateData: { salutation }
        }); */
        // Optional: kleine Pause, falls Rate Limits relevant sind
        await new Promise(r => setTimeout(r, 150));
        }

        return { ok: true, sent: list.length };
    
    } catch (error) {

        console.error(error);
        return sendRedirect(event, "/login", 302);
    }
  


})