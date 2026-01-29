export interface SchoolConfig {
  name: {
    th: string
    en: string
    short: {
      th: string
      en: string
    }
  }
  description: {
    th: string
    en: string
  }
  address: {
    th: string
    en: string
  }
  images: {
    logo: string
    cardLogo: string
  }
  links: {
    website: string
    facebook: string
  }
  contact: {
    phone: string
    email: string
  }
}

// PTK School Configuration
const ptkConfig: SchoolConfig = {
  name:  {
    th:  "โรงเรียนปทุมเทพวิทยาคาร",
    en: "Pathumthep Wittayakarn School",
    short: {
      th: "ป.ท. ค.",
      en: "PTK"
    }
  },
  description:  {
    th:  "ระบบดิจิทัลเพื่อการเรียนรู้และการบริหารจัดการ สำหรับนักเรียน ครู และผู้ปกครอง โรงเรียนปทุมเทพวิทยาคาร",
    en: "Digital system for learning and management for students, teachers, and parents of Pathumthep Wittayakarn School"
  },
  address:  {
    th:  "ถนนมิตรภาพ ตำบลโพธิ์ชัย อำเภอเมือง จังหวัดหนองคาย 43000",
    en: "Nong Khai, 43000, Thailand"
  },
  images: {
    logo: "/logo.svg",
    cardLogo: "/ptk-noname-logo.png"
  },
  links: {
    website: "https://schoolptk.ac.th",
    facebook: "https://www.facebook.com/prptk2558"
  },
  contact: {
    phone: "042-411-234",
    email: "info@schoolptk.ac.th"
  }
}

export const getSchoolConfig = (): SchoolConfig => {
  return ptkConfig
}
