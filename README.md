# Virtual Scroll (Infinite List Optimization)

## Proje Amacı

Bu proje, büyük veri listelerinde performans problemlerini çözmek için geliştirilmiş bir virtual scroll (windowing) implementasyonudur.
Amaç, binlerce DOM elementinin oluşturulmasının önüne geçerek daha akıcı ve verimli bir kullanıcı deneyimi sağlamaktır.

---

## Problem

Klasik listeleme yaklaşımında:

* Tüm veriler DOM’a basılır
* 10.000+ item sonrası ciddi performans düşüşü yaşanır
* Scroll lag, donma ve yüksek memory kullanımı oluşur

---

## Çözüm (Virtualization)

Bu projede:

* Sadece ekranda görünen item’lar render edilir
* Scroll hareketine göre DOM sürekli güncellenir
* Görünmeyen elementler tamamen kaldırılır

Bu yaklaşım sayesinde:

* Minimum DOM node
* Daha düşük memory kullanımı
* Yüksek FPS ve akıcı scroll deneyimi

---

## Teknik Yaklaşım

### 1. Windowing (Görünür Alan Hesabı)

* Scroll pozisyonuna göre başlangıç ve bitiş index hesaplanır
* Sadece bu aralıktaki veriler render edilir

### 2. Placeholder (Boşluk Simülasyonu)

* Üst ve alt boşluklar fake height ile simüle edilir
* Kullanıcı tüm liste varmış gibi scroll yapar

### 3. Dynamic Rendering

* Scroll event ile sürekli yeniden hesaplama yapılır
* DOM minimal seviyede tutulur

---

## Performans Kazanımı

| Senaryo     | Klasik Render | Virtual Scroll |
| ----------- | ------------- | -------------- |
| 10.000 item | Çok yavaş     | Akıcı          |
| DOM Node    | 10.000+       | ~20-50         |
| Memory      | Yüksek        | Düşük          |
| FPS         | Düşük         | Yüksek         |

---

## Kullanılan Teknikler

* Virtualization (Windowing)
* Scroll Event Optimization
* DOM Manipulation Minimization
* Lazy Rendering

---

## Canlı Demo

https://mesutyilmazjs.github.io/virtual-scroll/

---

## Geliştirme Fikirleri

* Variable height item desteği
* React / Vue versiyonu
* Intersection Observer optimizasyonu
* Horizontal + grid virtual scroll

---

## Sonuç

Bu proje, büyük veri listelerinde performansın nasıl ciddi şekilde artırılabileceğini gösterir.
Özellikle frontend ve backend birlikte çalıştığında (pagination + virtualization), sistem ölçeklenebilir hale gelir.
