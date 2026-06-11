package com.leadhunter;

import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {

    private final LeadRepository leadRepo;
    private final InteracaoRepository interRepo;
    private final CidadeRepository cidadeRepo;
    private final DespesaRepository despesaRepo;
    private final FinanceiroService finService;

    /** Pasta virtual dos leads sem cidade preenchida. */
    static final String SEM_CIDADE = "__SEM_CIDADE__";

    // ======================== LEADS ========================

    @GetMapping("/leads")
    public Page<Lead> listar(@RequestParam(required = false) String busca,
                             @RequestParam(required = false) Nicho nicho,
                             @RequestParam(required = false) String cidade,
                             @RequestParam(required = false) StatusNegociacao statusNegociacao,
                             @RequestParam(required = false) CategoriaServico categoriaServico,
                             @RequestParam(required = false) StatusSite statusSite,
                             Pageable pageable) {
        return leadRepo.filtrar(empty(busca), nicho, empty(cidade), statusNegociacao,
                categoriaServico, statusSite, pageable);
    }

    @GetMapping("/leads/{id}")
    public Lead buscar(@PathVariable String id) {
        return leadRepo.findById(id).orElseThrow();
    }

    @PostMapping("/leads")
    public ResponseEntity<Lead> criar(@RequestBody Lead lead) {
        if (lead.getNomeNegocio() == null || lead.getNomeNegocio().isBlank())
            return ResponseEntity.badRequest().build();
        lead.setId(null);
        if (lead.getStatusNegociacao() == null) lead.setStatusNegociacao(StatusNegociacao.NAO_CONTATADO);
        if (lead.getStatusSite() == null) lead.setStatusSite(StatusSite.NAO_VERIFICADO);
        return ResponseEntity.status(201).body(leadRepo.save(lead));
    }

    @PutMapping("/leads/{id}")
    public Lead atualizar(@PathVariable String id, @RequestBody Lead lead) {
        Lead existing = leadRepo.findById(id).orElseThrow();
        lead.setId(existing.getId());
        lead.setCreatedAt(existing.getCreatedAt());
        return leadRepo.save(lead);
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<Void> deletar(@PathVariable String id) {
        interRepo.deleteByLeadId(id);
        leadRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/leads/{id}/status")
    public Lead mudarStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Lead l = leadRepo.findById(id).orElseThrow();
        l.setStatusNegociacao(StatusNegociacao.valueOf(body.get("statusNegociacao")));
        return leadRepo.save(l);
    }

    /** Edição inline de campos avulsos (cidade, categoria, status do site, etc.). */
    @PatchMapping("/leads/{id}")
    public Lead editarCampos(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Lead l = leadRepo.findById(id).orElseThrow();
        if (body.containsKey("cidade"))     l.setCidade(emptyStr(str(body.get("cidade"))));
        if (body.containsKey("siteAtual"))  l.setSiteAtual(emptyStr(str(body.get("siteAtual"))));
        if (body.containsKey("nomeNegocio")) {
            String nome = str(body.get("nomeNegocio"));
            if (nome != null && !nome.isBlank()) l.setNomeNegocio(nome.trim());
        }
        if (body.containsKey("categoriaServico"))
            l.setCategoriaServico(parseEnum(CategoriaServico.class, body.get("categoriaServico")));
        if (body.containsKey("statusSite"))
            l.setStatusSite(parseEnum(StatusSite.class, body.get("statusSite")));
        if (body.containsKey("nicho"))
            l.setNicho(parseEnum(Nicho.class, body.get("nicho")));
        return leadRepo.save(l);
    }

    // ======================== FINANCEIRO (contratos fechados) ========================

    /** Cria/atualiza os dados financeiros de um lead (preserva mensalidades já quitadas). */
    @PutMapping("/leads/{id}/financeiro")
    public Lead salvarFinanceiro(@PathVariable String id, @RequestBody Financeiro fin) {
        Lead l = leadRepo.findById(id).orElseThrow();
        Financeiro atual = l.getFinanceiro();
        if (atual != null && atual.getPagamentos() != null
                && (fin.getPagamentos() == null || fin.getPagamentos().isEmpty())) {
            fin.setPagamentos(atual.getPagamentos());
        }
        if (fin.getPagamentos() == null) fin.setPagamentos(new ArrayList<>());
        l.setFinanceiro(fin);
        return leadRepo.save(l);
    }

    /** Marca uma mensalidade (ciclo) como paga. valorPago = mensalidade + multa por atraso. */
    @PostMapping("/leads/{id}/mensalidades/pagar")
    public Lead pagarMensalidade(@PathVariable String id, @RequestBody Map<String, String> body) {
        Lead l = leadRepo.findById(id).orElseThrow();
        Financeiro f = l.getFinanceiro();
        if (f == null) throw new IllegalStateException("Lead sem dados financeiros");
        LocalDate venc = LocalDate.parse(body.get("vencimento"));
        LocalDate dataPg = body.get("dataPagamento") != null && !body.get("dataPagamento").isBlank()
                ? LocalDate.parse(body.get("dataPagamento")) : LocalDate.now();
        if (f.getPagamentos() == null) f.setPagamentos(new ArrayList<>());
        f.getPagamentos().removeIf(p -> venc.equals(p.getVencimento()));
        MensalidadePagamento p = new MensalidadePagamento();
        p.setVencimento(venc);
        p.setDataPagamento(dataPg);
        double mens = f.getMensalidadeValor() != null ? f.getMensalidadeValor() : 0;
        p.setValorPago(finService.valorComMulta(mens, venc, dataPg));
        f.getPagamentos().add(p);
        return leadRepo.save(l);
    }

    /** Desfaz a baixa de uma mensalidade. */
    @PostMapping("/leads/{id}/mensalidades/estornar")
    public Lead estornarMensalidade(@PathVariable String id, @RequestBody Map<String, String> body) {
        Lead l = leadRepo.findById(id).orElseThrow();
        Financeiro f = l.getFinanceiro();
        if (f != null && f.getPagamentos() != null && body.get("vencimento") != null) {
            LocalDate venc = LocalDate.parse(body.get("vencimento"));
            f.getPagamentos().removeIf(p -> venc.equals(p.getVencimento()));
            leadRepo.save(l);
        }
        return l;
    }

    @GetMapping("/financeiro/resumo")
    public FinanceiroService.ResumoMes finResumo(@RequestParam(required = false) String mes) {
        return finService.resumoMes(parseMes(mes));
    }

    @GetMapping("/financeiro/serie")
    public List<FinanceiroService.SeriePonto> finSerie(@RequestParam(required = false) String mes,
                                                       @RequestParam(defaultValue = "6") int meses) {
        return finService.serie(parseMes(mes), Math.max(1, Math.min(meses, 24)));
    }

    @GetMapping("/financeiro/cobrancas")
    public List<FinanceiroService.Cobranca> finCobrancas() {
        return finService.cobrancas(LocalDate.now());
    }

    // ======================== DESPESAS ========================

    @GetMapping("/despesas")
    public List<Despesa> listarDespesas(@RequestParam(required = false) String mes) {
        List<Despesa> all = despesaRepo.findAll();
        if (mes == null || mes.isBlank()) {
            all.sort(Comparator.comparing(Despesa::getData, Comparator.nullsLast(Comparator.naturalOrder())));
            return all;
        }
        YearMonth ym = YearMonth.parse(mes);
        List<Despesa> filtradas = new ArrayList<>();
        for (Despesa d : all)
            if (d.getData() != null && YearMonth.from(d.getData()).equals(ym)) filtradas.add(d);
        filtradas.sort(Comparator.comparing(Despesa::getData));
        return filtradas;
    }

    @PostMapping("/despesas")
    public ResponseEntity<Despesa> criarDespesa(@RequestBody Despesa d) {
        if (d.getValor() == null) return ResponseEntity.badRequest().build();
        d.setId(null);
        if (d.getData() == null) d.setData(LocalDate.now());
        return ResponseEntity.status(201).body(despesaRepo.save(d));
    }

    @DeleteMapping("/despesas/{id}")
    public ResponseEntity<Void> deletarDespesa(@PathVariable String id) {
        despesaRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ======================== PASTAS (cidades / nichos) ========================

    @GetMapping("/pastas/cidades")
    public List<Map<String, Object>> pastasCidades() {
        Map<String, Long> counts = new LinkedHashMap<>();
        long semCidade = 0;
        for (Lead l : leadRepo.findAll()) {
            String c = l.getCidade();
            if (c == null || c.isBlank()) { semCidade++; continue; }
            counts.merge(c.trim(), 1L, Long::sum);
        }
        Set<String> nomes = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        nomes.addAll(counts.keySet());
        for (Cidade c : cidadeRepo.findAll())
            if (c.getNome() != null && !c.getNome().isBlank()) nomes.add(c.getNome().trim());

        List<Map<String, Object>> out = new ArrayList<>();
        for (String nome : nomes) {
            long total = counts.entrySet().stream()
                    .filter(e -> e.getKey().equalsIgnoreCase(nome))
                    .mapToLong(Map.Entry::getValue).sum();
            out.add(Map.of("nome", nome, "total", total));
        }
        if (semCidade > 0) out.add(Map.of("nome", SEM_CIDADE, "total", semCidade));
        return out;
    }

    @GetMapping("/pastas/nichos")
    public List<Map<String, Object>> pastasNichos(@RequestParam String cidade) {
        boolean sem = SEM_CIDADE.equals(cidade);
        Map<Nicho, Long> counts = new EnumMap<>(Nicho.class);
        for (Lead l : leadRepo.findAll()) {
            boolean match = sem
                    ? (l.getCidade() == null || l.getCidade().isBlank())
                    : (l.getCidade() != null && l.getCidade().trim().equalsIgnoreCase(cidade.trim()));
            if (!match) continue;
            if (l.getNicho() != null) counts.merge(l.getNicho(), 1L, Long::sum);
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (Nicho n : Nicho.values())
            out.add(Map.of("nicho", n.name(), "total", counts.getOrDefault(n, 0L)));
        return out;
    }

    @PostMapping("/pastas/cidades")
    public ResponseEntity<Map<String, Object>> criarCidade(@RequestBody Map<String, String> body) {
        String nome = body.get("nome");
        if (nome == null || nome.isBlank())
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe o nome da cidade"));
        nome = nome.trim();
        if (!cidadeRepo.existsByNomeIgnoreCase(nome)) {
            Cidade c = new Cidade();
            c.setNome(nome);
            cidadeRepo.save(c);
        }
        return ResponseEntity.status(201).body(Map.of("nome", nome));
    }

    @DeleteMapping("/pastas/cidades")
    public ResponseEntity<Void> deletarCidade(@RequestParam String nome) {
        cidadeRepo.findByNomeIgnoreCase(nome).ifPresent(cidadeRepo::delete);
        return ResponseEntity.noContent().build();
    }

    // ======================== INTERAÇÕES ========================

    @GetMapping("/leads/{id}/interacoes")
    public List<Interacao> listarInteracoes(@PathVariable String id) {
        return interRepo.findByLeadIdOrderByDataHoraDesc(id);
    }

    @PostMapping("/leads/{id}/interacoes")
    public ResponseEntity<Interacao> registrarInteracao(@PathVariable String id, @RequestBody Interacao dto) {
        Lead lead = leadRepo.findById(id).orElseThrow();
        dto.setId(null);
        dto.setLeadId(id);
        if (dto.getDataHora() == null) dto.setDataHora(LocalDateTime.now());
        Interacao saved = interRepo.save(dto);
        lead.setCanalUltimoContato(dto.getCanal());
        lead.setDataUltimoContato(dto.getDataHora().toLocalDate());
        leadRepo.save(lead);
        return ResponseEntity.status(201).body(saved);
    }

    // ======================== IMPORTAR CSV ========================

    private static final Map<String, List<String>> ALIASES = Map.of(
            "nomeNegocio",   List.of("title", "name", "businessname", "nomenegocio", "nome",
                                     "nomedaclinica", "nomedaclinicamedica", "nomedoneg", "razaosocial"),
            "telefone",      List.of("phone", "phonenumber", "telefone", "tel", "whatsapp", "contato", "fone"),
            "siteAtual",     List.of("website", "site", "url", "webpage",
                                     "linkdosite", "linkdositesehouver", "linkdosite sehouver"),
            "endereco",      List.of("address", "endereco", "fulladdress"),
            "cidade",        List.of("city", "cidade"),
            "avaliacao",     List.of("totalscore", "rating", "stars", "avaliacao", "nota"),
            "numeroReviews", List.of("reviewscount", "reviews", "reviewcount", "numreviews",
                                     "numerodeavaliacoes", "numdeavaliacoes", "qtdavaliacoes")
    );

    @PostMapping(value = "/leads/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> importar(@RequestParam("file") MultipartFile file,
                                                        @RequestParam("nicho") Nicho nicho,
                                                        @RequestParam(value = "cidade", required = false) String cidadePadrao,
                                                        @RequestParam(value = "apenasComTelefone", defaultValue = "false") boolean apenasComTelefone) {
        int importados = 0, ignorados = 0;
        List<String> erros = new ArrayList<>();

        // Lê tudo, remove BOM se houver, detecta separador (',' ou ';')
        String content;
        try {
            byte[] bytes = file.getBytes();
            content = new String(bytes, StandardCharsets.UTF_8);
            if (!content.isEmpty() && content.charAt(0) == '﻿') content = content.substring(1);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Não consegui ler o arquivo: " + e.getMessage()));
        }
        if (content.isBlank())
            return ResponseEntity.badRequest().body(Map.of("erro", "Arquivo vazio"));

        String firstLine = content.split("\\r?\\n", 2)[0];
        char delim = firstLine.chars().filter(c -> c == ';').count()
                   > firstLine.chars().filter(c -> c == ',').count() ? ';' : ',';

        try (Reader r = new java.io.StringReader(content);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setDelimiter(delim)
                     .setHeader().setSkipHeaderRecord(true)
                     .setIgnoreEmptyLines(true).setTrim(true).build().parse(r)) {

            Map<String, String> hmap = resolveHeaders(parser.getHeaderNames());
            if (!hmap.containsKey("nomeNegocio")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "erro", "Não encontrei a coluna do nome do negócio. " +
                                "Cabeçalhos lidos: " + parser.getHeaderNames() +
                                ". Use uma coluna como: title, name, nome."));
            }
            int linha = 1;
            List<Lead> lote = new ArrayList<>();
            for (CSVRecord rec : parser) {
                linha++;
                try {
                    String nome = get(rec, hmap, "nomeNegocio");
                    if (nome == null || nome.isBlank()) { ignorados++; continue; }
                    String telefone = get(rec, hmap, "telefone");
                    if (apenasComTelefone && (telefone == null || telefone.isBlank())) { ignorados++; continue; }
                    Lead l = new Lead();
                    l.setNomeNegocio(nome);
                    l.setTelefone(telefone);
                    String site = limparSite(get(rec, hmap, "siteAtual"));
                    l.setSiteAtual(site);
                    l.setEndereco(limparEndereco(get(rec, hmap, "endereco")));
                    String cidade = get(rec, hmap, "cidade");
                    l.setCidade(cidade != null ? cidade : (cidadePadrao != null && !cidadePadrao.isBlank() ? cidadePadrao : null));
                    l.setAvaliacao(parseD(get(rec, hmap, "avaliacao")));
                    l.setNumeroReviews(parseI(get(rec, hmap, "numeroReviews")));
                    l.setNicho(nicho);
                    // Link de WhatsApp/rede social no lugar do site conta como "sem site",
                    // mas fica salvo em siteAtual para conferência na listagem.
                    boolean temSite = site != null && !site.isBlank() && !isLinkNaoSite(site);
                    // Categoria automática a partir do site:
                    //  - já tem site  -> AUTOMACAO (vendemos só a automação)
                    //  - não tem site -> COMBO (site + automação)
                    l.setCategoriaServico(temSite ? CategoriaServico.AUTOMACAO : CategoriaServico.COMBO);
                    l.setStatusNegociacao(StatusNegociacao.NAO_CONTATADO);
                    l.setStatusSite(temSite ? StatusSite.SIM : StatusSite.NAO);
                    lote.add(l);
                    importados++;
                } catch (Exception ex) {
                    erros.add("Linha " + linha + ": " + ex.getMessage());
                    ignorados++;
                }
            }
            if (!lote.isEmpty()) leadRepo.saveAll(lote);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erro", "Erro ao processar CSV: " + ex.getMessage()));
        }
        return ResponseEntity.ok(Map.of(
                "importados", importados, "ignorados", ignorados, "erros", erros));
    }

    private Map<String, String> resolveHeaders(List<String> headers) {
        Map<String, String> map = new HashMap<>();
        for (String h : headers) {
            if (h == null) continue;
            String norm = normalize(h);
            for (var e : ALIASES.entrySet()) {
                if (map.containsKey(e.getKey())) continue;
                for (String alias : e.getValue()) {
                    String aliasNorm = normalize(alias);
                    if (norm.equals(aliasNorm) || norm.contains(aliasNorm)) { map.put(e.getKey(), h); break; }
                }
            }
        }
        return map;
    }

    private static String normalize(String s) {
        if (s == null) return "";
        String n = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return n.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    private static String limparSite(String s) {
        if (s == null || s.isBlank()) return null;
        String low = s.toLowerCase();
        if (low.contains("google.com/aclk")) return null;   // anúncio do Google
        if (low.contains("datasus.gov.br")) return null;    // cadastro público, não é o site da empresa
        return s;
    }

    // Domínios que aparecem como "site" no Google Maps mas são só perfil/contato
    // (deve casar com LINKS_NAO_SITE do frontend).
    private static final List<String> DOMINIOS_NAO_SITE = List.of(
            "wa.me", "whatsapp.com", "instagram.com", "facebook.com", "fb.com",
            "linktr.ee", "t.me");

    private static boolean isLinkNaoSite(String url) {
        String href = url.matches("(?i)^https?://.*") ? url : "https://" + url.trim();
        String host;
        try { host = java.net.URI.create(href).getHost(); } catch (Exception e) { return false; }
        if (host == null) return false;
        String h = host.toLowerCase().replaceFirst("^www\\.", "");
        return DOMINIOS_NAO_SITE.stream().anyMatch(d -> h.equals(d) || h.endsWith("." + d));
    }

    private static String limparEndereco(String s) {
        if (s == null || s.isBlank()) return null;
        String t = s.trim();
        if (t.equals("·") || t.equalsIgnoreCase("Fechado") || t.equals("-")) return null;
        return t;
    }

    private String get(CSVRecord rec, Map<String, String> hm, String campo) {
        String h = hm.get(campo);
        if (h == null) return null;
        try { String v = rec.get(h); return v == null || v.isBlank() ? null : v.trim(); }
        catch (Exception e) { return null; }
    }

    private Double parseD(String s) {
        if (s == null) return null;
        try { return Double.parseDouble(s.replace(",", ".")); } catch (Exception e) { return null; }
    }
    private Integer parseI(String s) {
        if (s == null) return null;
        try { return Integer.parseInt(s.replaceAll("[^0-9-]", "")); } catch (Exception e) { return null; }
    }

    // ======================== EXPORTAR CSV ========================

    @GetMapping(value = "/leads/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportar(@RequestParam(required = false) String busca,
                                           @RequestParam(required = false) Nicho nicho,
                                           @RequestParam(required = false) String cidade,
                                           @RequestParam(required = false) StatusNegociacao statusNegociacao,
                                           @RequestParam(required = false) CategoriaServico categoriaServico,
                                           @RequestParam(required = false) StatusSite statusSite) throws Exception {
        List<Lead> leads = leadRepo.filtrarLista(empty(busca), nicho, empty(cidade),
                statusNegociacao, categoriaServico, statusSite);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter p = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "id", "nomeNegocio", "telefone", "cidade", "endereco", "siteAtual", "statusSite",
                        "nicho", "categoriaServico", "statusNegociacao", "avaliacao", "numeroReviews",
                        "canalUltimoContato", "dataUltimoContato", "observacoes").build())) {
            for (Lead l : leads) {
                p.printRecord(l.getId(), l.getNomeNegocio(), l.getTelefone(), l.getCidade(),
                        l.getEndereco(), l.getSiteAtual(), l.getStatusSite(), l.getNicho(),
                        l.getCategoriaServico(), l.getStatusNegociacao(), l.getAvaliacao(),
                        l.getNumeroReviews(), l.getCanalUltimoContato(), l.getDataUltimoContato(),
                        l.getObservacoes());
            }
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leads.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(out.toByteArray());
    }

    // ======================== DASHBOARD ========================

    @GetMapping("/dashboard/resumo")
    public Map<String, Object> resumo() {
        long total = leadRepo.count();
        long fechados = leadRepo.countByStatusNegociacao(StatusNegociacao.FECHADO);
        long perdidos = leadRepo.countByStatusNegociacao(StatusNegociacao.PERDIDO);
        long naoContatado = leadRepo.countByStatusNegociacao(StatusNegociacao.NAO_CONTATADO);
        long emAndamento = Math.max(0, total - fechados - perdidos - naoContatado);
        double taxa = total == 0 ? 0.0 : Math.round(fechados * 10000.0 / total) / 100.0;

        Map<String, Long> porCategoria = new LinkedHashMap<>();
        Map<String, Long> porNicho = new LinkedHashMap<>();
        for (Lead l : leadRepo.findAll()) {
            if (l.getCategoriaServico() != null)
                porCategoria.merge(l.getCategoriaServico().name(), 1L, Long::sum);
            if (l.getNicho() != null)
                porNicho.merge(l.getNicho().name(), 1L, Long::sum);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalLeads", total);
        out.put("totalFechados", fechados);
        out.put("totalPerdidos", perdidos);
        out.put("totalEmAndamento", emAndamento);
        out.put("taxaConversao", taxa);
        out.put("leadsUltimos7Dias", leadRepo.countByCreatedAtAfter(LocalDateTime.now().minusDays(7)));
        out.put("porCategoria", porCategoria);
        out.put("porNicho", porNicho);
        return out;
    }

    @GetMapping("/dashboard/funil")
    public Map<String, Long> funil() {
        Map<String, Long> r = new LinkedHashMap<>();
        for (StatusNegociacao s : StatusNegociacao.values()) r.put(s.name(), 0L);
        for (Lead l : leadRepo.findAll())
            if (l.getStatusNegociacao() != null)
                r.merge(l.getStatusNegociacao().name(), 1L, Long::sum);
        return r;
    }

    private static String empty(String s) { return s == null || s.isBlank() ? null : s; }

    private static String str(Object o) { return o == null ? null : o.toString(); }

    private static String emptyStr(String s) { return s == null || s.isBlank() ? null : s.trim(); }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, Object value) {
        String s = str(value);
        if (s == null || s.isBlank()) return null;
        return Enum.valueOf(type, s.trim());
    }

    private static YearMonth parseMes(String mes) {
        return (mes == null || mes.isBlank()) ? YearMonth.now() : YearMonth.parse(mes);
    }
}
