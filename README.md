# HEMIS Tutor Groups Extractor

Bu Google Chrome kengaytmasi HEMIS tizimidagi guruhlari mavjud bo'lgan tutor ma'lumotlarini chiqarib olish uchun mo'ljallangan.

## Maqsad

Ushbu kengaytma HEMIS tizimining "Tyutor guruhlari" sahifasidan faqat guruhlari mavjud bo'lgan tutor ma'lumotlarini ajratib oladi:
- Tartib raqami
- To'liq ismi (faqat ism va familiya, lavozimlarsiz)
- Fakulteti
- Guruhlari
- Guruhlar soni (har bir tutorning nechta guruhga mas'ul ekanligi)
- Jami talabalar soni (barcha guruhlardagi talabalar soni yig'indisi)

Ma'lumotlar "To'liq ismi" bo'yicha alifbo tartibida saralanadi.

## O'rnatish

1. Chrome brauzerida `chrome://extensions` manziliga o'ting
2. Yuqori o'ng burchakdagi "Developer mode" tugmasini yoqing
3. "Load unpacked" tugmasini bosing
4. Ushbu papkani tanlang

## Foydalanish

1. HEMIS tizimiga kiring (istalgan sahifada bo'lishingiz mumkin)
2. Brauzer panelida kengaytma belgisini bosing
3. Kengaytma avtomatik ravishda tutor ma'lumotlarini olib keladi
4. Ochilgan oynada faqat guruhlari mavjud bo'lgan tutorlar ro'yxatini ko'rasiz

Kengaytma quyidagi holatlarda ishlaydi:
- Sahifa yuklanayotganda "Loading data..." xabarini ko'rsatadi
- Ma'lumotlar avtomatik ravishda HEMIS tutor guruhlari sahifasidan olinadi
- Sahifada guruhlari mavjud bo'lgan tutorlar bo'lmasa, bu haqda xabar beradi
- Ma'lumotlarni yuklashda xatolik yuz bersa, qo'llanma ko'rsatadi

## Xususiyatlar

- Guruh nomlari bosish mumkin bo'lgan havolalar sifatida ko'rsatiladi
- Har bir guruh nomi yonida talabalar soni ko'rsatiladi (masalan: 152-23 (22 ta))
- Har bir tutor uchun jami talabalar soni hisoblanadi
- Barcha tutorlar uchun umumiy talabalar soni jadval oxirida ko'rsatiladi
- Guruhlar alifbo tartibida saralanadi

## Xatoliklarni tuzatish

Agar "Could not establish connection" xatoligini ko'rsangiz:

1. HEMIS tizimiga kirganingizga ishonch hosil qiling
2. Sahifani yangilang (F5 tugmasini bosing)
3. Brauzeringizni yangilang
4. Kengaytmani qayta o'rnating

## Talablarni tekshirish

Agar kengaytma to'g'ri ishlamasa, quyidagilarni tekshiring:
- HEMIS tizimiga kirganingizga ishonch hosil qiling
- Sahifani yangilang
- Kengaytmani qayta o'rnating
- Brauzeringizni yangilang