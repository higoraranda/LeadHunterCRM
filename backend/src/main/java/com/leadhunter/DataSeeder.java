package com.leadhunter;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final LeadRepository repo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;

        add("Clínica Sorriso Feliz", "11999990001", null, StatusSite.NAO, "São Paulo",
                4.8, 120, Nicho.CLINICA_ODONTO, CategoriaServico.COMBO, StatusNegociacao.NAO_CONTATADO);
        add("Restaurante Sabor da Casa", "11999990002", "http://saborcasa.com", StatusSite.DESATUALIZADO, "São Paulo",
                4.5, 340, Nicho.RESTAURANTE, CategoriaServico.SITE, StatusNegociacao.TENTATIVA_1);
        add("Imobiliária Lar Doce Lar", "11999990003", "https://lardocelar.com.br", StatusSite.SIM, "Campinas",
                4.2, 80, Nicho.IMOBILIARIA, CategoriaServico.AUTOMACAO, StatusNegociacao.EM_NEGOCIACAO);
        add("Clínica Estética Bella", "11999990004", null, StatusSite.NAO, "Santos",
                4.9, 210, Nicho.CLINICA_ESTETICA, CategoriaServico.COMBO, StatusNegociacao.REUNIAO_AGENDADA);
        add("Construtora Pilar Forte", "11999990005", "http://pilarforte.com", StatusSite.DESATUALIZADO, "São Paulo",
                4.0, 45, Nicho.CONSTRUTORA, CategoriaServico.SITE, StatusNegociacao.PROPOSTA_ENVIADA);
        add("Dr. Carlos Advogado", "11999990006", null, StatusSite.NAO, "Rio de Janeiro",
                5.0, 30, Nicho.PROFISSIONAL_LIBERAL, CategoriaServico.COMBO, StatusNegociacao.FECHADO);
        add("Loja Virtual Top Moda", "11999990007", "https://topmoda.com", StatusSite.SIM, "Belo Horizonte",
                4.3, 500, Nicho.ECOMMERCE, CategoriaServico.AUTOMACAO, StatusNegociacao.TENTATIVA_2);
        add("Casa de Festa Alegria", "11999990008", null, StatusSite.NAO, "Guarulhos",
                4.6, 90, Nicho.CASA_DE_FESTA, CategoriaServico.SITE, StatusNegociacao.PERDIDO);
        add("Clínica Médica Vida", "11999990009", "http://clinicavida.com", StatusSite.DESATUALIZADO, "São Paulo",
                4.7, 180, Nicho.CLINICA_MEDICA, CategoriaServico.COMBO, StatusNegociacao.EM_NEGOCIACAO);
        add("Elétrica do Bairro", "11999990010", null, StatusSite.NAO, "Osasco",
                4.4, 65, Nicho.PRESTADOR_LOCAL, CategoriaServico.SITE, StatusNegociacao.NAO_CONTATADO);
    }

    private void add(String nome, String tel, String site, StatusSite ss, String cidade,
                     double rating, int reviews, Nicho nicho, CategoriaServico cat, StatusNegociacao status) {
        Lead l = new Lead();
        l.setNomeNegocio(nome); l.setTelefone(tel); l.setSiteAtual(site); l.setStatusSite(ss);
        l.setCidade(cidade); l.setAvaliacao(rating); l.setNumeroReviews(reviews);
        l.setNicho(nicho); l.setCategoriaServico(cat); l.setStatusNegociacao(status);
        if (status != StatusNegociacao.NAO_CONTATADO) {
            l.setCanalUltimoContato(Canal.COLD_CALL);
            l.setDataUltimoContato(LocalDate.now().minusDays(3));
        }
        repo.save(l);
    }
}
